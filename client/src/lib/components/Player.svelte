<script>
	import PlayerStatus from "./PlayerStatus.svelte";

	let { player, started, changename, setready, countdown } = $props();

	let input = $state(null);
	let hasChangedName = $state(false);
	let inputValue = $state("");

	function saveName() {
		changename(inputValue);
		hasChangedName = true;
	}

	function handleInput(event) {
		if (event.key === "Enter") {
			saveName();
		}
	}

	function setReady(ready) {
		setready(ready);
	}
</script>

<div class="flex flex-col self-center">
	{#if countdown > 0}
		<span class="text-center mb-4 text-xl text-white">
			Spelet startar om: {countdown} sekunder
		</span>
	{/if}
	<div
		class="flex items-stretch gap-2 bg-primary-50 p-3 rounded-md shadow-md"
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
			<button
				class="bg-emerald-700 cursor-pointer font-semibold rounded-md text-white px-2 py-0.5 hover:bg-emerald-800 flex justify-center items-center text-xl"
				onclick={saveName}
			>
				<span class="sr-only">Spara</span>
				<iconify-icon icon="gravity-ui:circle-check"></iconify-icon>
			</button>
		{:else}
			<span class="font-semibold px-2 py-0.5 text-center">
				{player.name}
			</span>
		{/if}

		{#if player.ready}
			<PlayerStatus ready={player.ready} />
		{:else}
			<button
				class="bg-emerald-700 cursor-pointer font-semibold rounded-md text-white px-2 py-0.5 text-sm hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
				onclick={() => setReady(true)}
				disabled={!hasChangedName}
			>
				{#if !hasChangedName}
					Välj namn först
				{:else}
					Jag är redo
				{/if}
			</button>
		{/if}
	</div>
</div>
