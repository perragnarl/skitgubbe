<script>
    import Card from "./Card.svelte";

    let { count } = $props();
</script>

<div class="flex justify-center">
    {#each Array(count) as _, i}
        <div>
            <Card hidden />
        </div>
    {/each}
</div>