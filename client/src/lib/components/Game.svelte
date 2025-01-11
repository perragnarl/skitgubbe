<script>
	import { socket } from "../stores/socket";
	import BattleStack from "./BattleStack.svelte";
	import Deck from "./Deck.svelte";
	import Player from "./Player.svelte";
	import TrumpIndicator from "./TrumpIndicator.svelte";

	let { playerId, playerList, phase, started } = $props();

	let trumpSuit = $state("");
	let deckCount = $state(0);
	let battleStack = $state([]);

	$socket.on("update-deck", (newDeckCount) => {
		deckCount = newDeckCount;
	});

	$socket.on("update-battle-stack", (newBattleStack) => {
		battleStack = newBattleStack;
	});

	$socket.on("trump-suit", (suit) => {
		trumpSuit = suit;
	});
</script>

<div class="h-full w-full">
	{#each playerList as player}
		<Player {playerId} {player} {phase} {playerList} {started} />
	{/each}

	<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-3">
		{#if phase === 1}
			{#if deckCount > 0}
				<Deck count={deckCount} {playerList} {playerId} />
			{/if}

			{#if battleStack.length > 0}
				<BattleStack table={battleStack} />
			{/if}
		{/if}

		{#if phase === 2}
			<TrumpIndicator {trumpSuit} />
		{/if}
	</div>
</div>
