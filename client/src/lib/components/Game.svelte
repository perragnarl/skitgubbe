<script>
	import toast from "svelte-5-french-toast";
	import { socket } from "../stores/socket";
	import Deck from "./Deck.svelte";
	import Opponent from "./Opponent.svelte";
	import Player from "./Player.svelte";
	import TrumpIndicator from "./TrumpIndicator.svelte";

	let { playerId, playerList,  phase, started } = $props();

	let trumpSuit = $state("");
	let deckCount = $state(0);

	$socket.on("update-deck", (newDeckCount) => {
		deckCount = newDeckCount;
	});

	$socket.on("trump-suit", (suit) => {
		trumpSuit = suit;
	});
</script>

<div
	class="h-full w-full"
>
	{#each playerList as player}
		<Player {playerId} {player} {phase} {playerList} {started} />
	{/each}
	<!-- <div>empty 1</div>
	{#each playerList as { name, table, hand, vault, current, id, position }}
		{#if id !== player.id && position === "top"}
			<Opponent
				{name}
				{table}
				{hand}
				{vault}
				{current}
				{phase}
				{position}
			/>
		{/if}
	{/each}

	<div>empty 3</div>

	{#each playerList as { name, table, hand, vault, current, id, position }}
		{#if id !== player.id && position === "left"}
			<Opponent
				{name}
				{table}
				{hand}
				{vault}
				{current}
				{phase}
				{position}
			/>
		{:else}
			<div></div>
		{/if}
	{/each}

	<div>
		{#if deckCount > 0 && phase === 1}
			<Deck count={deckCount} />
		{/if}

		{#if phase === 2}
			<TrumpIndicator {trumpSuit} />
		{/if}
	</div>

	{#each playerList as { name, table, hand, vault, current, id, position }}
		{#if id !== player.id && position === "right"}
			<Opponent
				{name}
				{table}
				{hand}
				{vault}
				{current}
				{phase}
				{position}
			/>
		{:else}
			<div></div>
		{/if}
	{/each}

	<div></div>

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
	<div>empty 9</div> -->
</div>
