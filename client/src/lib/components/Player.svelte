<script>
	import Hand from "./Hand.svelte";
	import OpponentBadge from "./OpponentBadge.svelte";
	import PlayerBadge from "./PlayerBadge.svelte";
	import PlayerTable from "./PlayerTable.svelte";

	let { playerId, player, phase, playerList, started } = $props();

	let isYou = playerId === player.id;

	let positionClass = {
		top: "top-6 left-1/2 -translate-x-1/2",
		right: "top-1/2 right-6 -translate-y-1/2",
		bottom: "bottom-6 left-1/2 -translate-x-1/2",
		left: "top-1/2 left-6 -translate-y-1/2",
	};

	let rotationClass = {
		top: "rotate-180",
		right: "rotate-180",
		bottom: "rotate-0",
		left: "rotate-180",
	};
</script>

<div
	class="absolute flex-col flex items-center {positionClass[player.position]} {rotationClass[
		player.position
	]}"
>
	<div class={rotationClass[player.position]}>
		<PlayerTable {phase} table={player.table} />
	</div>

	<div class={rotationClass[player.position]}>
		<Hand {isYou} {phase} {player} />
	</div>

	<div class={rotationClass[player.position]}>
		{#if isYou}
			<PlayerBadge {started} {player} {playerList} />
		{:else}
			<OpponentBadge {player} />
		{/if}
	</div>
</div>
