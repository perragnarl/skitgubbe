<script>
	let { player = $bindable(), readychange, countdown } = $props();

	function handleReady(ready) {
		readychange(ready);
	}
</script>

<div class="min-h-96 flex items-center justify-center">
	{#if player?.ready}
		<button
			class="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
			onclick={() => handleReady(false)}
		>
			Jag är inte redo!
		</button>
	{:else}
		<button
			class="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
			onclick={() => handleReady(true)}
		>
			Jag är redo!
		</button>
	{/if}
</div>
{#if countdown > 0}
	<div class="flex justify-center">
		<p class="text-center text-4xl">Spelet startar om: {countdown}</p>
	</div>
{/if}
