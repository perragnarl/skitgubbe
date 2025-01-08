<script>
	import PlayerStatus from "./PlayerStatus.svelte";

	let { player, started, changename, readychange, countdown } = $props();

	let edit = $state(false);
	let input = $state(null);
	let hasChangedName = $state(false);
	let inputValue = $state("");

	function saveName() {
		changename(inputValue);
		edit = false;
	}

	function handleInput(event) {
		if (event.key === "Enter") {
			saveName();
			hasChangedName = true;
		}
	}

	function handleReady(ready) {
		readychange(ready);
	}
</script>

<div class="fixed bottom-8 self-center flex flex-col">
	{#if countdown > 0}
		<p class="text-center mb-4 text-xl text-white">
			Spelet startar om: {countdown} sekunder
		</p>
	{/if}
	<div
		class="flex items-stretch gap-1 bg-primary-50 p-3 rounded-md shadow-md relative z-10"
	>
		<iconify-icon icon="lineicons:user-4" class="text-3xl"></iconify-icon>
		{#if !hasChangedName && !started}
			<input
				class="border text-center border-primary-500 text-primary-900 px-2 py-0.5 rounded-md"
				type="text"
				placeholder="Välj namn"
				bind:value={inputValue}
				onkeydown={handleInput}
				bind:this={input}
			/>
		{:else}
			<p class="font-semibold px-2 py-0.5 text-center">
				{player.name}
			</p>
		{/if}

		{#if player.ready}
			<PlayerStatus ready={player.ready} />
		{:else}
			<button
				class="bg-emerald-700 cursor-pointer font-semibold rounded-md text-white px-2 py-0.5 text-sm hover:bg-emerald-800"
				onclick={handleReady}
			>
				Jag är redo
			</button>
		{/if}
	</div>
</div>
