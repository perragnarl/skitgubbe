<script>
	import Card from "./Card.svelte";

    let { phase, table } = $props();
</script>

<div class="flex justify-center gap-3 h-32">
    {#if phase === 1}
        {#each table as { suit, label }}
            <Card {suit} {label} />
        {/each}
    {:else if phase === 2}
        {#each table as cards}
            {#each cards as { suit, label }}
                <Card {suit} {label} />
            {/each}
        {/each}
    {/if}
</div>