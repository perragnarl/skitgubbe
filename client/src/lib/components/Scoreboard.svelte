<script>
	import { socket } from "../stores/socket";
	import { windowStatus } from "../stores/windows";
	import Window from "./Window.svelte";

	let scoreboard = $state([]);

	$socket.on("game-over", (gameScoreboard) => {
		scoreboard = gameScoreboard;
		console.log(scoreboard);

		windowStatus.update((status) => ({ ...status, scoreBoard: true }));
	});

	function resetGame() {
		$socket.emit("reset-game");
	}
</script>

<Window label="Resultat" key="scoreBoard" left={40} top={36}>
	{#if scoreboard.length === 0}
		<p class="py-4">Spel pågår...</p>
	{:else}
		<h3 class="text-4xl text-center mb-10 px-4 mt-2">
			{scoreboard.at(-1).name} blev skitgubbe!
		</h3>

		<div class="text-center">
			<h4 class="font-bold mb-2">Hela listan:</h4>
			<ol class="list-decimal pl-4 mb-10">
				{#each scoreboard as player}
					<li>
						{player.name}
					</li>
				{/each}
			</ol>
		</div>

		<div class="flex justify-center">
			<button
				onclick={resetGame}
				class="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
			>
				Spela igen
			</button>
		</div>
	{/if}
</Window>
