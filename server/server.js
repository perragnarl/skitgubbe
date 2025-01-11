import { deckTemplate } from "./deck.js";
import { Server } from "socket.io";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

const isDocker = process.env.IS_DOCKER === "true";
let io;

if (isDocker) {
  setupProduction();
} else {
  setupDevelopment();
}

function setupDevelopment() {
  io = new Server(1337, {
    cors: {
      origin: ["http://localhost:1338"],
    },
    serveClient: false,
    transports: ["websocket", "polling"],
    allowEIO3: true,
  });
}

function setupProduction() {
  const app = express();
  const server = http.createServer(app);
  io = new Server(server, {
    serveClient: false,
    transports: ["websocket", "polling"],
    allowEIO3: true,
  });

  // Serve svelte app from the public directory
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use(express.static(path.join(__dirname, "public")));

  // Start the server
  const PORT = 1337;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

const testPhase2 = false; // Test phase 2

const cardsLeftInDeckBeforePhase2 = 1;
const maxPlayers = 4;
const countdownTime = 5;
const moveCardsFromTableToVaultDelay = 1.5;
const colors = {
  1: "red",
  2: "blue",
  3: "green",
  4: "orange",
  5: "purple",
};

let players = [];
let gamePhase = 0;
let deck = [];
let isStarted = false;
let battleRound = false;
let battleStack = [];
let trumpSuit = "";
let countdownInterval;
let scoreboard = [];
let positions = ["top", "bottom", "right", "left"];

io.on("connection", (socket) => {
  console.log("New connection", socket.id);

  // Check for available seats
  if (players.length === maxPlayers) {
    socket.emit("full", players);
    return;
  }

  // Check if the game has already started
  if (isStarted) {
    socket.emit("game-started", gamePhase);
    return;
  }

  // Create a player object
  let player = {
    id: socket.id,
    ready: false,
    name: `Spelare ${players.length + 1}`,
    color: colors[players.length + 1],
    hand: [],
    table: [],
    vault: [],
    current: false,
    inBattle: false,
    position: positions[players.length],
    roundOrder: -1,
  };

  // Add the player to the list of players
  players.push(player);

  console.log("Players", players);

  socket.emit("connection", player.id, players, isStarted);

  // Notify other players that a new player has joined
  socket.broadcast.emit("new-player", player);

  // Update all players with the current list of players
  updatePlayers();

  // Handle player disconnect
  socket.on("disconnect", () => {
    players = players.filter((p) => p.id !== socket.id);
    socket.broadcast.emit("player-left", player);
    updatePlayers();
  });

  // Handle disconnect all players
  socket.on("disconnect-all", () => {
    players = [];
    Object.values(io.of("/").sockets).forEach((s) => s.disconnect(true));
    updatePlayers();
  });

  // Reset the game
  socket.on("reset-game", () => {
    console.log("Resetting game");

    resetGame();
    updatePlayers();
    io.emit("reset-game");
  });

  // Handle chat messages
  socket.on("chat", (msg) => {
    io.emit("chat", player, msg);
  });

  // Handle player name change
  socket.on("change-name", (name) => {
    let oldName = player.name;
    player.name = name;
    console.log(`${player.id} changed name to ${name}`);

    io.emit("name-change", { oldName, newName: name });
    updatePlayers();
  });

  socket.on("ready-change", (ready) => {
    player.ready = ready;
    console.log(`${player.id} is ready: ${player.ready}`);
    socket.broadcast.emit("ready-change", player);

    updatePlayers();

    if (!ready) {
      // Abort the countdown if a player is not ready
      if (countdownInterval) {
        clearInterval(countdownInterval);
        io.emit("countdown-aborted");
      }
      return;
    }

    if (players.length > 1 && players.every((p) => p.ready)) {
      console.log("All players are ready");
      io.emit("all-ready");
      updateDeckCount();

      // Start the countdown timer
      let countdown = countdownTime;
      io.emit("countdown", countdown);

      countdownInterval = setInterval(() => {
        countdown -= 1;
        io.emit("countdown", countdown);

        if (countdown <= 0) {
          clearInterval(countdownInterval);
          startGame();
        }
      }, 1000);
    }

    updatePlayers();
  });

  // Handle deck play (chansa)
  socket.on("play-from-deck", async () => {
    const card = deck.shift();
    await playCards({ cards: [card], fromDeck: true });

    // Update the players
    updatePlayers();
  });

  // Handle single card play (phase 1)
  socket.on("play-card", async (card) => {
    await playCards({ cards: [card] });

    // Update the players
    updatePlayers();
  });

  // Handle multiple card play (phase 2)
  socket.on("play-cards", async (cards) => {
    // Check if the cards are valid
    const valid = checkCards(cards);
    if (valid) {
      await playCards({ cards });
    } else {
      socket.emit("invalid-cards");
    }

    // Update the players
    updatePlayers();
  });

  socket.on("pick-up", (player) => {
    console.log("Picking up cards", player);

    let lowestCardArray = null;
    let playerWithLowestCardArray = null;

    // Find the lowest card array on all the players' tables
    players.forEach((p) => {
      console.log("Checking player: ", p.id);

      p.table.forEach((cardArray) => {
        console.log("Checking card array: ", cardArray);

        if (!lowestCardArray || cardArray[0].value < lowestCardArray[0].value) {
          console.log("Found lowest card array", cardArray);
          console.log("Player with lowest card array", p.name);

          lowestCardArray = cardArray;
          playerWithLowestCardArray = p;
        }
      });
    });

    if (lowestCardArray && playerWithLowestCardArray) {
      // Remove the specific card array from the holder's table
      const index = playerWithLowestCardArray.table.indexOf(lowestCardArray);
      if (index > -1) {
        playerWithLowestCardArray.table.splice(index, 1);
      }

      // Add the lowest card array to the current player's hand
      players.find((p) => p.id === player.id).hand.push(...lowestCardArray);

      // Set next player
      setNextPlayer();
    } else {
      socket.emit("no-pick-up");
    }

    // Update the players
    updatePlayers();
  });

  function checkCards(cards) {
    /*
     *  Check if the cards are valid
     *  - Same suit
     *  - In sequence
     *  - Higher than the previous player
     *  - Trump suit if the previous player played a different suit
     */
    let isTrump = false;
    const suit = cards[0].suit;

    // Check that all the cards are of the same suit
    if (!cards.every((c) => c.suit === suit)) {
      console.log("Not the same suit");
      return false;
    }

    // Check if the cards are trump
    if (suit === trumpSuit) {
      console.log("Playing trump");
      isTrump = true;
    }

    // Check if the cards are in sequence
    const sortedCards = cards.sort((a, b) => a.value - b.value);
    for (let i = 0; i < sortedCards.length - 1; i++) {
      if (sortedCards[i].value + 1 !== sortedCards[i + 1].value) {
        console.log("Not in sequence");
        return false;
      }
    }

    // Get the previous player
    const previousPlayer = players.find(
      (p) => p.id !== player.id && p.table.length > 0
    );

    if (previousPlayer) {
      const prevPlayerLastStack = previousPlayer.table.at(-1);
      const previousPlayerData = {
        lastStack: prevPlayerLastStack,
        suit: prevPlayerLastStack[0].suit,
        highestCard: previousPlayer.table.reduce((maxCard, currentCard) => {
          return currentCard.value > maxCard.value ? currentCard : maxCard;
        }, prevPlayerLastStack[0]),
        trump: prevPlayerLastStack[0].suit === trumpSuit,
      };
      const currentPlayerLowestCard = cards.reduce((minCard, currentCard) => {
        return currentCard.value < minCard.value ? currentCard : minCard;
      }, cards[0]);

      console.log("Previous player: ", previousPlayerData);

      console.log("Current player: ", {
        suit: suit,
        lowestCard: currentPlayerLowestCard,
        trump: isTrump,
      });

      // Check if the previous player played trump and the current player is not playing trump
      if (previousPlayerData.trump && !isTrump) {
        console.log("Previous player played trump, must play trump");
        return false;
      }

      // Check if the previous player played a different suit
      if (previousPlayerData.suit !== suit) {
        if (player.hand.some((c) => c.suit === suit)) {
          // Check if current player played trump
          if (!isTrump) {
            console.log(
              "Previous player played a different suit, must play same suit or trump"
            );
            return false;
          }
        }
      }

      // Check if the current player is playing cards of same suit but lower value
      const sameSuit = previousPlayerData.suit === suit;
      const lowerValue =
        currentPlayerLowestCard.value < previousPlayerData.highestCard.value;
      if (sameSuit && lowerValue) {
        console.log("Playing lower value than previous player");
        return false;
      }
    }

    return true;
  }

  async function playCards({ cards, fromDeck = false }) {
    if (gamePhase === 1) {
      await playPhase1Card(cards[0], fromDeck);

      // Update the deck count
      updateDeckCount();
    } else if (gamePhase === 2) {
      playPhase2Card(cards);
    }
  }

  async function playPhase1Card(card, fromDeck = false) {
    const isLastCardInDeck = deck.length === cardsLeftInDeckBeforePhase2;
    console.log(`${player.id} played ${card.value} of ${card.suit}`);

    // Remove the card from the player's hand
    if (!fromDeck) {
      player.hand = player.hand.filter(
        (c) => c.value !== card.value || c.suit !== card.suit
      );
    }

    // Add the card to the player's table
    player.table.push(card);

    console.log("Cards left: ", deck.length);

    // Update the players
    updatePlayers();

    // Give a new card to the player
    if (!fromDeck && !isLastCardInDeck) {
      player.hand.push(deck.shift());
    }

    // Check if the player is last in the round
    let isLastPlayer = players.every((p) => p.table.length > 0);

    // If so, round is over
    // TODO: Have to know if its a battle round
    if (isLastPlayer) {
      console.log("Round is over");

      // Find the highest card on the table of all players
      let highest = 0;
      players.forEach((p) => {
        if (p.table[0].value > highest) {
          highest = p.table[0].value;
        }
      });

      // Find all players who played the highest card
      let playersWithHighestCard = players.filter(
        (p) => p.table[0].value === highest
      );

      // A slight delay before announcing the winner
      await delay(2000);

      // Check if there are multiple players with the highest card
      if (playersWithHighestCard.length > 1) {
        // If there are multiple players with the highest card, start a battle round
        initBattleRound(playersWithHighestCard);
      } else {
        // If there is only one player with the highest card, set them as the winner
        setRoundWinner(playersWithHighestCard[0]);
        console.log("Round winner", playersWithHighestCard[0]);
      }
    } else {
      // Find the next player (next in array) and set them as current
      setNextPlayer();
    }

    // Check to see if it's time to move to phase 2
    if (isLastCardInDeck) {
      // Check to see if not all players have at least one card left on hand and that no cards are on the table
      if (
        players.some((p) => p.hand.length === 0) &&
        players.every((p) => p.table.length === 0)
      ) {
        initPhase2();
      }
    }
  }

  function playPhase2Card(cards) {
    console.log(`${player.id} played ${cards.length} cards`);

    // Remove the cards from the player's hand
    player.hand = player.hand.filter(
      (c) =>
        !cards.some((card) => card.value === c.value && card.suit === c.suit)
    );

    // Check if player has no cards left
    if (player.hand.length === 0) {
      console.log("Player has no cards left");

      // Add player to scoreboard
      scoreboard.push(player);
      io.emit("player-ended", player);
    }

    // Check if there is only one player left with cards in hand
    if (players.filter((p) => p.hand.length > 0).length === 1) {
      console.log("Only one player left with cards in hand");

      // Add the last player to the scoreboard
      scoreboard.push(players.find((p) => p.hand.length > 0));
      io.emit("game-over", scoreboard);
      console.log("Game over", scoreboard);
    }

    // Add the cards to the player's table
    player.table.push(...[cards]);

    // If the current player is the last player scrap the cards on the table
    const totalCardArraysOnTables = players
      .map((p) => p.table.length)
      .reduce((a, b) => a + b);
    console.log("Total card arrays on tables: ", totalCardArraysOnTables);
    console.log("Players: ", players.length);
    if (totalCardArraysOnTables === players.length) {
      // Remove all cards from the table
      players.forEach((p) => {
        p.table = [];
      });
    } else {
      // Find the next player (next in array) and set them as current
      setNextPlayer();
    }
  }

  function setNextPlayer() {
    let currentPlayer = players.find((player) => player.current);
    currentPlayer.current = false;

    // If it's a battle round, make sure the next player is in battle
    if (battleRound) {
      let nextPlayer = players.find(
        (player) =>
          player.roundOrder === (currentPlayer.roundOrder + 1) % players.length &&
          player.inBattle
      );
      nextPlayer.current = true;
      return;
    }

    // Find the next player based on the round order
    let nextPlayer = players.find(
      (player) =>
        player.roundOrder === (currentPlayer.roundOrder + 1) % players.length
    );
    nextPlayer.current = true;
  }

  function setRoundWinner(winner) {
    // Announce the winner
    io.emit("round-winner", winner);

    // Wait for a moment before moving the cards, TODO: Not working
    // await delay(moveCardsFromTableToVaultDelay * 1000);

    players.forEach((p) => {
      winner.vault.push(...p.table);
      p.table = [];
    });

    // Reset battle round
    if (battleRound) {
      resetBattleRound(winner);
    }

    // Set the winner as the current player
    players.forEach((p) => (p.current = p.id === winner.id));
  }

  function initBattleRound(playersWithHighestCard) {
    // Set the battle round flag
    battleRound = true;
    console.log("Starting battle round");
    io.emit("battle-round", playersWithHighestCard);

    // Mark all players who played the highest card as in battle
    playersWithHighestCard.forEach((p) => (p.inBattle = true));
    
    // Move all cards to the battle stack
    players.forEach((p) => {
      battleStack.push(...p.table);
      p.table = [];
    });

    // Find the current player and mark them as not current
    let currentPlayer = players.find((player) => player.current);
    currentPlayer.current = false;
    
    // Find the player who first played the highest card and set them as the current player
    playersWithHighestCard[0].current = true;
    console.log("Next player in battle: ", playersWithHighestCard[0]);

    io.emit("update-battle-stack", battleStack);
  }

  function resetBattleRound(winner) {
    // Move all cards from the battle stack to the winner's vault
    winner.vault.push(...battleStack);
    // Clear the battle stack
    battleStack = [];
    // Reset the battle round flag
    battleRound = false;
    // Mark all players as not in battle
    players.forEach((p) => (p.inBattle = false));
    io.emit("update-battle-stack", battleStack);
  }

  function initPhase2() {
    gamePhase = 2;

    io.emit("phase-change", gamePhase);

    // Set trump suit to last card in deck
    trumpSuit = deck[deck.length - 1].suit;

    // Notify all players of the trump suit
    io.emit("trump-suit", trumpSuit);

    // Give last card (trump) to the last winner
    player.hand.push(deck.shift());

    // Move all cards from the players tables to their vaults
    players.forEach((p) => {
      p.vault.push(...p.table);
      p.table = [];
    });

    // Move all cards from players vault to players hand
    players.forEach((p) => {
      p.hand.push(...p.vault);
      p.vault = [];
    });

    // Sort the cards in the players' hands by suit and descending value
    players.forEach((p) => {
      p.hand.sort((a, b) => {
        if (a.suit === b.suit) {
          return b.value - a.value; // Descending order by value
        }
        return a.suit.localeCompare(b.suit); // Sort by suit
      });
    });
  }

  function resetGame() {
    players.forEach((player) => {
      player.hand = [];
      player.table = [];
      player.vault = [];
      player.current = false;
      player.ready = false;
    });
    gamePhase = 0;
    deck = [];
    isStarted = false;
  }

  function startGame() {
    if (isStarted) {
      return;
    }

    isStarted = true;

    // Handle game start
    console.log("Game is starting");

    // Enter the first phase of the game
    gamePhase = 1;

    // Notify all players that the game has started
    io.emit("start-game", gamePhase);

    // Create a deck of cards
    deck = [...deckTemplate];

    // Shuffle the deck
    deck.sort(() => Math.random() - 0.5);

    // Deal 3 cards to each player
    players.forEach((player) => {
      player.hand = deck.splice(0, 3);
    });

    // Randomly select a player to start
    let startingPlayer = players[Math.floor(Math.random() * players.length)];
    console.log(`Starting with ${startingPlayer.id}`);
    startingPlayer.current = true;
    startingPlayer.roundOrder = 0;

    // Define the clockwise order of positions
    const positionOrder = ["top", "right", "bottom", "left"];

    // Set round order for the rest of the players in a clockwise order based on player.position
    let currentPlayerPosition = startingPlayer.position;
    players.forEach((player) => {
      if (player.id !== startingPlayer.id) {
        let currentIndex = positionOrder.indexOf(currentPlayerPosition);
        let playerIndex = positionOrder.indexOf(player.position);
        let roundOrder =
          (playerIndex - currentIndex + positionOrder.length) %
          positionOrder.length;
        player.roundOrder = roundOrder;
      }
    });

    updateDeckCount();
    updatePlayers();

    // To test phase 2
    if (testPhase2) {
      console.log("Testing phase 2");
      initTestPhase2();
    }
  }

  function updateDeckCount() {
    io.emit("update-deck", deck.length);
  }

  function updatePlayers() {
    console.log("Updating players");

    io.emit("update-players", players);
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function initTestPhase2() {
    initPhase2();
    players[0].hand = [
      { value: 1, suit: "hearts", label: "1" },
      { value: 2, suit: "hearts", label: "2" },
      { value: 3, suit: "spades", label: "3" },
    ];

    players[1].hand = [
      { value: 1, suit: "spades", label: "1" },
      { value: 2, suit: "spades", label: "2" },
      { value: 3, suit: "hearts", label: "3" },
    ];

    trumpSuit = "hearts";
    deck = [];
    io.emit("trump-suit", trumpSuit);
    updateDeckCount();
    updatePlayers();
  }
});
