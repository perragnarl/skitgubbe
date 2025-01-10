<script>
	import Hand from "./Hand.svelte";
	import OpponentBadge from "./OpponentBadge.svelte";
	import PlayerTable from "./PlayerTable.svelte";
	import Vault from "./Vault.svelte";

	let { name, table, hand, vault, current, phase, position } = $props();
</script>

<div class="flex flex-col items-center">
	<OpponentBadge {current} {name} />

	<div class="rotate-180">
		<Hand {current} cards={hand} {phase} />
	</div>

	<PlayerTable {phase} {table} />

	{#if phase === 1 && vault.length > 0}
		<Vault count={vault.length} />
	{/if}
</div>
