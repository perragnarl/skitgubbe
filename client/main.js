import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

const button = document.querySelector("button");
const playerName = document.getElementById("playername");
const playerCount = document.getElementById("playercount");
const handEl = document.getElementById("hand");
const chatInput = document.getElementById("chat");
const log = document.getElementById("log");

socket.on("connection", (player, players) => {
	playerName.value = player.name;
	playerName.style.color = player.color;
	playerCount.textContent = players.length;
});

socket.on("new-player", (player) => {
	playerCount.textContent = parseInt(playerCount.textContent) + 1;
	logit(`${player.name} har anslutit till spelet`);
});

socket.on("player-left", (player) => {
	playerCount.textContent = parseInt(playerCount.textContent) - 1;
	logit(`${player.name} har lämnat spelet`);
});

socket.on("full", (players) => {
	logit("Spelet är fullt");
});

socket.on("start-game", () => {
	logit("Spelet har startat");
});

socket.on("hand", (hand, deckSize) => {
	logit(`Du har fått ${hand.length} kort. Kvar i leken: ${deckSize}`);
	handEl.innerHTML = "";

	hand.forEach((card) => {
		const cardElement = document.createElement("div");
		cardElement.textContent = `${card.value} of ${card.suit}`;
		handEl.appendChild(cardElement);
	});
});

socket.on("chat", (player, msg) => {
	let msgEl = document.createElement("div");
	msgEl.textContent = `<span style="color: ${player.color}">${player.name}</span>: ${msg}`;
	log.appendChild(msgEl);
});

socket.on("name-change", ({ oldName, newName }) => {
	logit(`${oldName} bytte namn till ${newName}`);
});

button.addEventListener("click", () => {
	socket.emit("start-game");
});

chatInput.addEventListener("keydown", (e) => {
	if (e.key === "Enter") {
		socket.emit("chat", chatInput.value);
		chatInput.value = "";
	}
});

playerName.addEventListener("keydown", (e) => {
	if (e.key === "Enter") {
		socket.emit("change-name", playerName.value);
	}
});

function logit(msg) {
	const msgEl = document.createElement("div");
	msgEl.textContent = msg;
	log.appendChild(msgEl);
	log.scrollTop = log.scrollHeight;
}
