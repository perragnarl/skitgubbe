<script>
	import Hand from "./Hand.svelte";
	import PlayerTable from "./PlayerTable.svelte";
	import Vault from "./Vault.svelte";

	let { name, table, hand, vault, current, phase, position } = $props();
</script>

<div class="flex flex-col items-center">
	<div class="inline-flex flex-col self-center">
		<div
			class="flex items-stretch gap-1 bg-primary-50 p-2 rounded-md shadow-md relative z-10"
		>
			<p class="font-semibold px-2 py-0.5 text-center">
				{name}
			</p>
		</div>
	</div>

	<div class="rotate-180">
		<Hand {current} cards={hand} {phase} />
	</div>

	<PlayerTable {phase} {table} />

	{#if phase === 1 && vault.length > 0}
		<Vault count={vault.length} />
	{/if}
</div>
