<script>
	import Card from "./Card.svelte";

	let { player = $bindable(), playerList = $bindable() } = $props();
</script>

<div class="flex flex-col justify-between">
	{#each playerList as p}
		{#if p.id !== player.id}
			<div class="flex gap-3">
				{#each p.hand as { suit, value }}
					<Card {suit} {value} hidden />
				{/each}
			</div>
		{/if}
	{/each}


	{#each playerList as p}
		{#if p.id === player.id}
			<div class="flex gap-3">
				{#each p.hand as { suit, value }}
					<Card {suit} {value} />
				{/each}
			</div>
		{/if}
	{/each}
</div>
