<script>
	import { io } from "socket.io-client";
	import { socket } from "./store.js";

	$socket = io("http://localhost:3000");

	import Chat from "./lib/components/Chat.svelte";
	import Lobby from "./lib/components/Lobby.svelte";
	import Log from "./lib/components/Log.svelte";
	import Player from "./lib/components/Player.svelte";
	import PlayerList from "./lib/components/PlayerList.svelte";
	import Card from "./lib/components/Card.svelte";
	import Hand from "./lib/components/Hand.svelte";

	let started = $state(false);
	let player = $state({
		id: "",
		name: "",
		color: "",
		ready: false,
		hand: [],
		current: false,
	});
	let playerList = $state([]);

	$socket.on("connection", (playerInfo) => {
		player = playerInfo;
	});

	$socket.on("update-players", (newList) => {
		playerList = [...newList];
	});

	$socket.on("update-player", (playerInfo) => {
		player = playerInfo;
	});

	$socket.on("all-ready", () => {
		started = true;
	});

	$socket.on("current-player", (playerInfo) => {
		player = playerInfo;
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

	function playCard(card, current) {
		if (!current) return;	
		
		$socket.emit("play-card", card);
	}
</script>

<main class="container mx-auto p-4 relative flex flex-col justify-between">
	<h1 class="text-2xl font-bold">Skitgubbe</h1>

	{#if started}
		<div class="flex flex-col justify-between">
			{#each playerList as p}
				{#if p.id !== player.id}
					<Hand current={p.current}>
						{#each p.hand as { suit, value }}
							<Card {suit} {value} hidden onclick={null} />
						{/each}
					</Hand>
				{/if}
			{/each}

			{#each playerList as p}
				{#if p.id === player.id}
					<Hand current={p.current}>
						{#each p.hand as card}
							<Card
								suit={card.suit}
								value={card.value}
								onclick={() => playCard(card, p.current)}
							/>
						{/each}
					</Hand>
				{/if}
			{/each}
		</div>
	{:else}
		<Lobby bind:player readychange={readyChange} />
	{/if}

	<div
		class="fixed grid grid-cols-4 gap-2 justify-between bottom-0 left-0 right-0 p-4 border-t border-black container mx-auto"
	>
		<Log />
		<Chat />
		<Player changename={changeName} bind:player {started} />
		<PlayerList disconnectall={disconnectAll} bind:playerList {started} />
	</div>
</main>
