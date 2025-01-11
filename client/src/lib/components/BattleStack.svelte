<script>
	import Card from "./Card.svelte";

	let { table } = $props();
</script>

<div class="flex justify-center gap-3">
	{#each table as { suit, label }}
		<Card {suit} {label} />
	{/each}
</div>
