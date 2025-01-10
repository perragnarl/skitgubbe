<script>
	import Hand from "./Hand.svelte";
	import Player from "./Player.svelte";
	import PlayerTable from "./PlayerTable.svelte";
	import Vault from "./Vault.svelte";

	let { table, hand, vault, current, phase, player, started, playerList } = $props();
</script>

<PlayerTable {phase} {table} />

<Hand {current} cards={hand} isYou {phase} {player} />

{#if phase === 1 && vault.length > 0}
	<Vault count={vault.length} isYou />
{/if}

<div class="mt-12">
	<Player {started} {player} {playerList} />
</div>
