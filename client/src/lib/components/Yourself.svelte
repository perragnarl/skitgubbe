<script>
	import Hand from "./Hand.svelte";
	import PlayerTable from "./PlayerTable.svelte";
	import Vault from "./Vault.svelte";

	let { table, hand, vault, current, selected, phase, clickcard, pickup } =
		$props();

	function clickCard(card, current, isSelected) {
		clickcard(card, current, isSelected);
	}

	function pickUp() {
		pickup();
	}
</script>

<PlayerTable {phase} {table} />

<Hand {current} cards={hand} {selected} clickcard={clickCard} isYou {phase} />

{#if phase === 2}
	<button
		onclick={pickUp}
		disabled={current}
		class="bg-red-700 text-white px-1 py-0.5"
	>
		Ta upp
	</button>
{/if}

{#if phase === 1 && vault.length > 0}
	<Vault count={vault.length} isYou />
{/if}
