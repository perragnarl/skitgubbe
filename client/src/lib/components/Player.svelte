<script>
	import { socket } from "../stores/socket";
	import PlayerStatus from "./PlayerStatus.svelte";

	let { player, playerList, started } = $props();

	let input = $state(null);
	let hasChangedName = $state(false);
	let inputValue = $state("");
	let current = $state(false);

	$effect(() => {
		let currentPlayer = playerList.find((p) => player.id === p.id);
		current = currentPlayer.current;
	});

	function saveName() {
		$socket.emit("change-name", inputValue);
		hasChangedName = true;
	}

	function handleInput(event) {
		if (event.key === "Enter") {
			saveName();
		}
	}

	function setReady(ready) {
		$socket.emit("ready-change", ready);
	}
</script>

<div class="flex flex-col fixed bottom-8 left-1/2 -translate-x-1/2 gap-2">
	<div
		class:border-amber-300={current}
		class:border-transparent={!current}
		class="flex items-stretch gap-2 bg-primary-50 border-4 py-2 px-3 rounded-md shadow-md"
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
