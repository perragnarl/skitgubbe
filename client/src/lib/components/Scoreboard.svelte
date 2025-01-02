<script>
	let { scoreboard } = $props();
</script>

{#if scoreboard}
	<h3 class="text-4xl my-10">{scoreboard.at(-1).name} blev skitgubbe!</h3>

	<h4 class="font-bold mb-2">Hela listan:</h4>
	<ol class="list-decimal pl-4">
		{#each scoreboard as player}
			<li>
				{player.name}
			</li>
		{/each}
	</ol>
{/if}
