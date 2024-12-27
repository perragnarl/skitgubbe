<script>
	let { player = $bindable(), readychange, onGoing } = $props();

	function handleReady(ready) {
		readychange(ready);
	}
</script>

{#if onGoing}
	<p>Spelet är redan igång, vänta på nästa runda</p>
{:else}
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
{/if}
