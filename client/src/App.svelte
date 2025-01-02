<script>
	import { io } from "socket.io-client";
	import { socket } from "./store.js";

	const hostname = window.location.hostname;
	const port = import.meta.env.PROD ? window.location.port : 1337;
	$socket = io(`http://${hostname}:${port}`);

	import Chat from "./lib/components/Chat.svelte";
	import Lobby from "./lib/components/Lobby.svelte";
	import Log from "./lib/components/Log.svelte";
	import Player from "./lib/components/Player.svelte";
	import PlayerList from "./lib/components/PlayerList.svelte";
	import Card from "./lib/components/Card.svelte";
	import Hand from "./lib/components/Hand.svelte";
	import { suits } from "./lib/utils/suits.js";
	import Scoreboard from "./lib/components/Scoreboard.svelte";

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

	$socket.on("connection", (playerInfo, activePlayerList, isStarted) => {
		console.log("Connected to server");

		player = playerInfo;
		playerList = activePlayerList;
		onGoing = isStarted;
	});

	$socket.on("update-players", (newList) => {
		playerList = newList;
	});

	$socket.on("update-player", (playerInfo) => {
		player = playerInfo;
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

	function readyChange(ready) {
		$socket.emit("ready-change", ready);
	}

	function disconnectAll() {
		$socket.emit("disconnect-all");
	}

	function resetGame() {
		$socket.emit("reset-game");
	}

	function clickCard(card, current, isSelected) {
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
</script>

<main class="container mx-auto p-4 relative flex flex-col justify-between">
	<h1 class="text-2xl font-bold">Skitgubbe</h1>

	{#if started}
		<div class="flex flex-col justify-between">
			{#each playerList as p}
				{#if p.id !== player.id}
					<Hand current={p.current}>
						{p.name} bord
						<div>
							{#if phase === 1}
								{#each p.table as { suit, label }}
									<Card {suit} {label} />
								{/each}
							{:else if phase === 2}
								{#each p.table as cards}
									{#each cards as { suit, label }}
										<Card {suit} {label} />
									{/each}
								{/each}
							{/if}
						</div>
						{p.name} hand
						<div>
							{#each p.hand as { suit, label }}
								<Card {suit} {label} hidden />
							{/each}
						</div>
						{#if p.vault.length > 0}
							{p.name} valv
							<div>
								<Card count={p.vault.length} hidden />
							</div>
						{/if}
					</Hand>
				{/if}
			{/each}

			{#each playerList as p}
				{#if p.id === player.id}
					<Hand current={p.current}>
						Ditt bord
						<div>
							{#if phase === 1}
								{#each p.table as { suit, label }}
									<Card {suit} {label} />
								{/each}
							{:else if phase === 2}
								{#each p.table as cards}
									{#each cards as { suit, label }}
										<Card {suit} {label} />
									{/each}
								{/each}
							{/if}
						</div>
						Din hand
						<div>
							{#each p.hand as card}
								{@const isSelected = player.selected.some(
									(c) =>
										c.suit === card.suit &&
										c.label === card.label,
								)}

								<Card
									suit={card.suit}
									label={card.label}
									onclick={() =>
										clickCard(card, p.current, isSelected)}
									selected={isSelected}
								/>
							{/each}
							{#if phase === 2}
								<button
									onclick={pickUp}
									disabled={!p.current}
									class="bg-red-700 text-white px-1 py-0.5"
								>
									Ta upp
								</button>
							{/if}
						</div>
						{#if p.vault.length > 0}
							Ditt valv
							<div>
								<Card count={p.vault.length} hidden />
							</div>
						{/if}
					</Hand>
				{/if}
			{/each}
		</div>

		{#if deckCount > 0}
			<div>
				Högen
				<div>
					<Card count={deckCount} hidden onclick={playFromDeck} />
				</div>
			</div>
		{/if}

		{#if trumpSuit !== ""}
			<div>
				Trumf:
				<span style="color: {suits[trumpSuit].color};">
					{suits[trumpSuit].symbol}
				</span>
				{suits[trumpSuit].label}
			</div>
		{/if}
	{:else if scoreboard.length > 0}
		<Scoreboard {scoreboard} />
		<button
			onclick={resetGame}
			class="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
		>
			Spela igen
		</button>
	{:else}
		<Lobby bind:player readychange={readyChange} {onGoing} {countdown} />
	{/if}

	<div
		class="fixed grid grid-cols-4 gap-2 justify-between bottom-0 left-0 right-0 p-4 border-t border-black container mx-auto"
	>
		<Log />
		<Chat />
		<Player changename={changeName} bind:player {started} />
		<PlayerList
			resetgame={resetGame}
			disconnectall={disconnectAll}
			bind:playerList
			{started}
		/>
	</div>
</main>
