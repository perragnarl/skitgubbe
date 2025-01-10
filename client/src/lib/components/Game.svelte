<script>
	import toast from "svelte-5-french-toast";
	import { socket } from "../stores/socket";
	import Deck from "./Deck.svelte";
	import Opponent from "./Opponent.svelte";
	import Yourself from "./Yourself.svelte";
	import TrumpIndicator from "./TrumpIndicator.svelte";

	let { player, playerList, started, phase } = $props();

	let trumpSuit = $state("");
	let deckCount = $state(0);

	$socket.on("update-deck", (newDeckCount) => {
		deckCount = newDeckCount;
	});

	$socket.on("trump-suit", (suit) => {
		trumpSuit = suit;
	});
</script>

<div class="flex flex-col justify-between gap-2 h-full">
	{#each playerList as { name, table, hand, vault, current, id }}
		{#if id !== player.id}
			<Opponent
				{name}
				{table}
				{hand}
				{vault}
				{current}
				{phase}
				position="top"
			/>
		{/if}
	{/each}

	{#if deckCount > 0 && phase === 1}
		<Deck count={deckCount} />
	{/if}

	{#if phase === 2}
		<TrumpIndicator {trumpSuit} />
	{/if}

	{#each playerList as { table, hand, vault, current, id }}
		{#if id === player.id}
			<Yourself
				{player}
				{table}
				{hand}
				{vault}
				{current}
				{phase}
				{started}
				{playerList}
			/>
		{/if}
	{/each}
</div>
