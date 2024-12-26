<script>
	import BottomBox from "./BottomBox.svelte";

	let { playerList = $bindable(), started, disconnectall } = $props();

	function disconnectAll() {
		disconnectall();
	}
</script>

<BottomBox title="Spelarlista">
	{#each playerList as player}
		<div class="flex justify-between">
			<p>{player.name}</p>
			<p>{player.ready ? "✅" : "❌"}</p>
		</div>
	{/each}
	<button
		class="border px-2 py-0.5 rounded border-dashed block mt-8 disabled:opacity-50 cursor-pointer"
		disabled={started}
		onclick={disconnectAll}>Disconnect all</button
	>
</BottomBox>
