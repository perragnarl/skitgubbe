<script>
	import BottomBox from "./BottomBox.svelte";

	let {
		playerList = $bindable(),
		started,
		disconnectall,
		resetgame,
	} = $props();

	function disconnectAll() {
		disconnectall();
	}

	function resetGame() {
		resetgame();
	}
</script>

<BottomBox title="Spelarlista">
	{#each playerList as player}
		<div class="flex justify-between">
			<p>{player.name}</p>
			<p>{player.ready ? "✅" : "❌"}</p>
		</div>
	{/each}
	{#snippet bottom()}
		<div class="flex flex-col gap-2">
			<button
				class="border px-2 py-0.5 rounded border-dashed block disabled:opacity-50 cursor-pointer"
				disabled={started}
				onclick={disconnectAll}>Disconnect all</button
			>
			<button
				class="border px-2 py-0.5 rounded border-dashed block disabled:opacity-50 cursor-pointer"
				disabled={started}
				onclick={resetGame}>Reset game</button
			>
		</div>
	{/snippet}
</BottomBox>
