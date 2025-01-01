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
      origin: ["http://localhost:5173"],
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

const maxPlayers = 4;
const countdownTime = 5;
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

io.on("connection", (socket) => {
  console.log("New connection", socket.id);

  // Check for available seats
  if (players.length === maxPlayers) {
    socket.emit("full", players);
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
    battleHand: [],
  };

  // Add the player to the list of players
  players.push(player);

  socket.emit("connection", player, players, isStarted);

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
    resetGame();
    updatePlayer();
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
    updatePlayer();
  });

  socket.on("ready-change", (ready) => {
    player.ready = ready;
    console.log(`${player.id} is ready: ${player.ready}`);
    socket.broadcast.emit("ready-change", player);

    updatePlayer();

    // if (players.length > 2 && players.every((p) => p.ready)) {
    if (players.every((p) => p.ready)) {
      console.log("All players are ready");
      io.emit("all-ready");
      updateDeckCount();

      // Start the countdown timer
      let countdown = countdownTime;
      io.emit("countdown", countdown);

      const countdownInterval = setInterval(() => {
        countdown -= 1;
        io.emit("countdown", countdown);

        if (countdown <= 0) {
          clearInterval(countdownInterval);
          startGame();
        }
      }, 1000);
    }
  });

  socket.on("play-from-deck", () => {
    const card = deck.shift();
    playCard({ card, fromDeck: true });
  });

  // Handle card play
  socket.on("play-card", (card) => {
    playCard({ card });
  });

  function playCard({ card, fromDeck = false }) {
    if (gamePhase === 1) {
      playPhase1Card(card, fromDeck);

      // Update the deck count
      updateDeckCount();
    } else if (gamePhase === 2) {
      playPhase2Card(card);
    }

    // Update the player
    updatePlayer();
  }

  function playPhase1Card(card, fromDeck = false) {
    const isLastCardInDeck = deck.length === 1;
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

    // Give a new card to the player
    if (!fromDeck && !isLastCardInDeck) {
      player.hand.push(deck.shift());
    }

    // Remove current player status
    player.current = false;

    // Check if the player is last in the round
    if (players.every((p) => p.table.length > 0)) {
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

      // Check if there are multiple players with the highest card
      if (playersWithHighestCard.length > 1) {
        // If there are multiple players with the highest card, start a battle round
        initBattleRound(playersWithHighestCard);
      } else {
        // If there is only one player with the highest card, set them as the winner
        setRoundWinner(playersWithHighestCard[0]);
      }
    } else {
      // Find the next player (next in array) and set them as current
      setNextPlayer();
    }

    // Check to see if it's time to move to phase 2
    if (isLastCardInDeck) {
      // Check to see if not all players have at least one card left on hand
      if (players.some((p) => p.hand.length === 0)) {
        initPhase2();
      }
    }
  }

  function playPhase2Card(card) {
    console.log(`${player.id} played ${card.value} of ${card.suit}`);
  }

  function setNextPlayer() {
    let index = players.indexOf(player);
    player.current = false;
    if (index === players.length - 1) {
      players[0].current = true;
    } else {
      players[index + 1].current = true;
    }
  }

  function setRoundWinner(winner) {
    // Move all cards from the players tables to the winner's vault
    players.forEach((p) => {
      winner.vault.push(...p.table);
      p.table = [];
    });

    socket.emit("round-winner", winner);

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
    socket.emit("battle-round", playersWithHighestCard);

    // Mark all players who played the highest card as in battle
    playersWithHighestCard.forEach((p) => (p.inBattle = true));

    // Set the current player to the player who first played the highest card
    let currentPlayer = playersWithHighestCard.find((p) => p.id === player.id);

    // Move all cards to the battle stack
    players.forEach((p) => {
      battleStack.push(...p.table);
      p.table = [];
    });

    currentPlayer.current = true;
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

    // Notify all players that the game has started
    io.emit("start-game");

    // Enter the first phase of the game
    gamePhase = 1;

    // Create a deck of cards
    deck = [...deckTemplate];

    // Shuffle the deck
    deck.sort(() => Math.random() - 0.5);

    // Deal 3 cards to each player
    players.forEach((player) => {
      player.hand = deck.splice(0, 3);
    });

    updatePlayers();
    updateDeckCount();

    // Randomly select a player to start
    let currentPlayer = players[Math.floor(Math.random() * players.length)];
    console.log(`Starting with ${currentPlayer.id}`);
    currentPlayer.current = true;
    updatePlayer();
  }

  function updateDeckCount() {
    io.emit("update-deck", deck.length);
  }

  function updatePlayer() {
    socket.emit("update-player", player);
    updatePlayers();
  }

  function updatePlayers() {
    io.emit("update-players", players);
  }
});
