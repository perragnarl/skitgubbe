import { deckTemplate } from "./deck.js";
import { Server } from "socket.io";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

const isDocker = process.env.IS_DOCKER === "true";

let io;
if (isDocker) {
  const app = express();
  const server = http.createServer(app);
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:1337"],
    },
    serveClient: false,
    transports: ["websocket", "polling"],
    allowEIO3: true,
  });

  // Serve static files from the public directory
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use(express.static(path.join(__dirname, "public")));

  // Start the server
  const PORT = 1337;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
} else {
  io = new Server(3000, {
    cors: {
      origin: ["http://localhost:5173"],
    },
    serveClient: false,
    transports: ["websocket", "polling"],
    allowEIO3: true,
  });
}

const maxPlayers = 4;
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

io.on("connection", (socket) => {
  console.log("New connection");

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
      startGame();
    }
  });

  // Handle card play
  socket.on("play-card", (card) => {
    if (gamePhase === 1) {
      console.log(`${player.id} played ${card.value} of ${card.suit}`);

      // Remove the card from the player's hand
      player.hand = player.hand.filter(
        (c) => c.value !== card.value || c.suit !== card.suit
      );

      // Add the card to the player's table
      player.table.push(card);

      // TODO: Logic to see if there are enough cards left in the deck before starting phase 2
      console.log("Cards left: ", deck.length);

      if (deck.length === 0) {
        gamePhase = 2;
      } else {
        // Give a new card to the player
        player.hand.push(deck.shift());

        // Remove current player status
        player.current = false;
      }

      // Check if the player is last in the round
      if (players.every((p) => p.table.length === 1)) {
        console.log("Round is over");

        // Find the highest card on the table of all players
        let highest = 0;
        players.forEach((p) => {
          if (p.table[0].value > highest) {
            highest = p.table[0].value;
          }
        });

        // Console log all the players cards on their table
        players.forEach((p) => {
          console.log(`${p.id} table: `, p.table);
        });

        // Find all players who played the highest card
        let playersWithHighestCard = players.filter(
          (p) => p.table[0].value === highest
        );

        if (playersWithHighestCard.length > 1) {
          // Set the battle round flag
          battleRound = true;
          console.log("Starting battle round");
          socket.emit("battle-round", playersWithHighestCard);

          // Mark all players who played the highest card as in battle
          playersWithHighestCard.forEach((p) => (p.inBattle = true));

          // Set the current player to the player who first played the highest card
          let currentPlayer = playersWithHighestCard.find(
            (p) => p.id === player.id
          );

          // Move all cards to the battle stack
          players.forEach((p) => {
            battleStack.push(...p.table);
            p.table = [];
          });

          currentPlayer.current = true;
        } else {
          // Find the player with the highest card
          let winner = players.find((p) => p.table[0].value === highest);

          // Move all cards from the players tables to the winner's vault
          players.forEach((p) => {
            winner.vault.push(...p.table);
            p.table = [];
          });

          socket.emit("round-winner", winner);

          // Reset battle round
          if (battleRound) {
            // Move all cards from the battle stack to the winner's vault
            winner.vault.push(...battleStack);
            // Clear the battle stack
            battleStack = [];
            // Reset the battle round flag
            battleRound = false;
            // Mark all players as not in battle
            players.forEach((p) => (p.inBattle = false));
          }

          // Set the winner as the current player
          players.forEach((p) => (p.current = p.id === winner.id));
        }
      } else {
        // Find the next player (next in array) and set them as current
        let index = players.indexOf(player);
        player.current = false;
        if (index === players.length - 1) {
          players[0].current = true;
        } else {
          players[index + 1].current = true;
        }
      }
    } else if (gamePhase === 2) {
      // Something
    }

    // Update the player
    updatePlayer();
  });

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

    // Randomly select a player to start
    let currentPlayer = players[Math.floor(Math.random() * players.length)];
    console.log(`Starting with ${currentPlayer.id}`);
    currentPlayer.current = true;
    updatePlayer();
  }

  function updatePlayer() {
    socket.emit("update-player", player);
    updatePlayers();
  }

  function updatePlayers() {
    io.emit("update-players", players);
  }
});
