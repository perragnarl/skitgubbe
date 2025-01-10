<script>
	import { io } from "socket.io-client";
	import { socket } from "./lib/stores/socket";
	import { windowStatus } from "./lib/stores/windows";

	const protocol = window.location.protocol;
	const hostname = window.location.hostname;
	const port = import.meta.env.PROD ? window.location.port : 1337;

	$socket = io(`${protocol}//${hostname}:${port}`);

	import Chat from "./lib/components/Chat.svelte";
	import Log from "./lib/components/Log.svelte";
	import Player from "./lib/components/Player.svelte";
	import PlayerList from "./lib/components/PlayerList.svelte";
	import Scoreboard from "./lib/components/Scoreboard.svelte";
	import Game from "./lib/components/Game.svelte";
	import Controls from "./lib/components/Controls.svelte";
	import Status from "./lib/components/Status.svelte";

	let phase = $state(0);
	let onGoing = $state(false);
	let player = $state({
		id: "",
		name: "",
		color: "",
		ready: false,
		hand: [],
		vault: [],
		selected: [],
		table: [],
		current: false,
	});
	let scoreboard = $state([]);
	let playerList = $state([]);
	let deckCount = $state(0);
	let trumpSuit = $state("");
	let countdown = $state(-1);
	let started = $derived(countdown === 0 ? true : false);

	$effect(() => {
		started ? (phase = 1) : null;
	});

	$inspect(player);

	$socket.on("connection", (playerInfo, activePlayerList, isStarted) => {
		console.log("Connected to server");

		player = { ...playerInfo };
		playerList = activePlayerList;
		onGoing = isStarted;
	});

	$socket.on("update-players", (newList) => {
		playerList = newList;
	});

	$socket.on("update-player", (playerInfo) => {
		player = { ...playerInfo };
	});

	$socket.on("update-deck", (newDeckCount) => {
		deckCount = newDeckCount;
	});

	$socket.on("countdown", (timeleft) => {
		countdown = timeleft;
	});

	$socket.on("countdown-aborted", () => {
		countdown = -1;
	});

	$socket.on("current-player", (playerInfo) => {
		player = playerInfo;
	});

	$socket.on("trump-suit", (suit) => {
		trumpSuit = suit;
	});

	$socket.on("phase-change", (newPhase) => {
		phase = newPhase;
	});

	$socket.on("invalid-cards", () => {
		player.selected = [];
		alert("Invalid cards selected");
	});

	$socket.on("game-over", (gameScoreboard) => {
		scoreboard = gameScoreboard;
		countdown = -1;
	});

	function changeName(name) {
		$socket.emit("change-name", name);
	}

	function setReady(ready) {
		$socket.emit("ready-change", ready);
	}

	function disconnectAll() {
		$socket.emit("disconnect-all");
	}

	function resetGame() {
		$socket.emit("reset-game");
	}

	function clickCard(card, current, isSelected) {
		console.log("clickCard", card, current, isSelected);

		if (!current) return;

		if (phase === 1) {
			$socket.emit("play-card", card);
			return;
		}

		// If card is selected emit the selected cards
		if (isSelected) {
			$socket.emit("play-cards", player.selected);
		} else {
			player.selected = [...player.selected, card];
		}
	}

	function pickUp() {
		$socket.emit("pick-up", player);
	}

	function playFromDeck() {
		$socket.emit("play-from-deck");
	}

	function openWindow(key) {
		windowStatus.update((status) => ({ ...status, [key]: true }));
	}
</script>

<main
	class="container mx-auto p-4 relative flex flex-col justify-between h-screen select-none"
>
	<Log />
	<Chat />
	<PlayerList
		resetgame={resetGame}
		disconnectall={disconnectAll}
		bind:playerList
		{started}
	/>

	<Controls openwindow={openWindow} />

	<Status {onGoing} {phase} />
	
	{#if started}
		<Game
			{phase}
			{player}
			{playerList}
			{deckCount}
			{trumpSuit}
			clickcard={clickCard}
			pickup={pickUp}
			playfromdeck={playFromDeck}
		/>
	{:else if scoreboard.length > 0}
		<Scoreboard {scoreboard} />
		<button
			onclick={resetGame}
			class="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
		>
			Spela igen
		</button>
	{/if}

	<Player
		changename={changeName}
		setready={setReady}
		{countdown}
		{started}
		{player}
	/>
</main>
