<script>
	import PlayerStatus from "./PlayerStatus.svelte";
import Window from "./Window.svelte";

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

<Window label="Spelare" key="playerList">
	<ul class="mb-2">
		{#each playerList as player}
			<li
				class="flex justify-between items-center border-b border-primary-200 py-2"
			>
				<p>{player.name}</p>
				<PlayerStatus ready={player.ready} />
			</li>
		{/each}
	</ul>
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
</Window>
