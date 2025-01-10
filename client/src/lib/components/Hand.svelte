<script>
	import { cardRotation } from "../utils/cardRotation";
	import Card from "./Card.svelte";

	let {
		current,
		cards,
		selected = null,
		clickcard = null,
		isYou = false,
		phase,
	} = $props();

	function clickCard(card, current, isSelected) {
		clickcard(card, current, isSelected);
	}
</script>

<div class="flex justify-center p-2 gap-3 rounded">
	<div
		class="flex border-2 {current
			? 'border-amber-300'
			: 'border-transparent'} rounded-lg p-4"
	>
		{#each cards as card, i}
			{#if isYou}
				{@const isSelected = selected.some(
					(c) => c.suit === card.suit && c.label === card.label,
				)}
				<div style={phase === 1 ? `transform: ${cardRotation(i, cards.length)}` : ""}>
					<Card
						suit={card.suit}
						label={card.label}
						{selected}
						onclick={() => clickCard(card, current, isSelected)}
					/>
				</div>
			{:else}
				<div style={phase === 1 ? `transform: ${cardRotation(i, cards.length)}` : ""}>
					<Card suit={card.suit} label={card.label} hidden />
				</div>
			{/if}
		{/each}
	</div>
</div>
