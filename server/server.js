const io = require("socket.io")(3000, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

const maxPlayers = 4;
const suits = ["hearts", "diamonds", "clubs", "spades"];
const values = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];
const colors = {
  1: "red",
  2: "blue",
  3: "green",
  4: "orange",
  5: "purple",
};
let players = [];

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
    current: false,
  };

  // Add the player to the list of players
  players.push(player);

  socket.emit("connection", player, players);

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

    if (players.every((p) => p.ready)) {
      console.log("All players are ready");
      io.emit("all-ready");
      startGame();
    }
  });

  // Handle card play
  socket.on("play-card", (card) => {
    console.log(`${player.id} played ${card.value} of ${card.suit}`);

    // Remove the card from the player's hand
    player.hand = player.hand.filter(
      (c) => c.suit !== card.suit || c.value !== card.value
    );

    // Notify all players that the card has been played
    io.emit("card-played", player, card);

    updatePlayer();
  });

  function startGame() {
    // Handle game start
    console.log("Game is starting");

    // Notify all players that the game has started
    io.emit("start-game");

    // Create a deck of cards
    let deck = [];
    suits.forEach((suit) => {
      values.forEach((value) => {
        deck.push({
          suit: suit,
          value: value,
        });
      });
    });

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
