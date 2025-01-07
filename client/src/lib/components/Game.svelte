<script>
	import { suits } from "../utils/suits";
	import Card from "./Card.svelte";
	import Deck from "./Deck.svelte";
	import Opponent from "./Opponent.svelte";
	import Window from "./Window.svelte";
	import Yourself from "./Yourself.svelte";

	let {
		phase,
		player,
		playerList,
		deckCount,
		trumpSuit,
		clickcard,
		pickup,
		playfromdeck,
	} = $props();

	function pickUp() {
		pickup();
	}

	function clickCard(card, current, isSelected) {
		clickcard(card, current, isSelected);
	}

	function playFromDeck() {
		playfromdeck();
	}
</script>

<div class="flex flex-col justify-between h-full">
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

	{#if deckCount > 0}
		<Deck count={deckCount} onclick={playFromDeck} />
	{/if}

	{#each playerList as { table, hand, vault, current, id, selected }}
		{#if id === player.id}
			<Yourself
				{table}
				{hand}
				{vault}
				{current}
				{selected}
				{phase}
				clickcard={clickCard}
				pickup={pickUp}
			/>
		{/if}
	{/each}
</div>

{#if trumpSuit !== ""}
	<div>
		Trumf:
		<span style="color: {suits[trumpSuit].color};">
			{suits[trumpSuit].symbol}
		</span>
		{suits[trumpSuit].label}
	</div>
{/if}
