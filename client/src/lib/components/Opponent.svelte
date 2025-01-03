<script>
	import Hand from "./Hand.svelte";
	import PlayerTable from "./PlayerTable.svelte";
	import Vault from "./Vault.svelte";

	let { name, table, hand, vault, current, phase, position } = $props();
</script>

<div class="rotate-180">
	<PlayerTable {phase} {table} />

	<Hand {current} cards={hand} />

	{#if phase === 1}
		<Vault count={vault.length} />
	{/if}
</div>
