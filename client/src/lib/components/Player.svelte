<script>
	import Hand from "./Hand.svelte";
	import OpponentBadge from "./OpponentBadge.svelte";
	import PlayerBadge from "./PlayerBadge.svelte";
	import PlayerTable from "./PlayerTable.svelte";
	import Vault from "./Vault.svelte";

	let {
		playerId,
		player,
		phase,
		playerList,
		started
	} = $props();

	let isYou = playerId === player.id;
	let { hand, vault, table, current, position } = player;

	let positionClass = {
		top: "top-6 left-1/2 -translate-x-1/2 flex-col",
		right: "top-1/2 right-6 -translate-y-1/2",
		bottom: "bottom-6 left-1/2 -translate-x-1/2 flex-col",
		left: "top-1/2 left-6 -translate-y-1/2",
	};

	let rotationClass = {
		top: "rotate-180",
		right: "rotate-270",
		bottom: "rotate-0",
		left: "rotate-90",
	};
</script>

{#snippet topPlayer()}
	{#if isYou}
		<PlayerBadge {started} {player} {playerList} />
	{:else}
		<OpponentBadge {player} />
	{/if}
	<div class={rotationClass[position]}>
		<Hand current={player.current} cards={hand} {isYou} {phase} {player} />
	</div>

	{#if phase === 1 && vault.length > 0}
		<Vault count={vault.length} {isYou} />
	{/if}

	<PlayerTable {phase} table={player.table} />
{/snippet}

{#snippet bottomPlayer()}
	<PlayerTable {phase} table={player.table} />

	<div class={rotationClass[position]}>
		<Hand current={player.current} cards={hand} {isYou} {phase} {player} />
	</div>

	{#if phase === 1 && vault.length > 0}
		<Vault count={vault.length} {isYou} />
	{/if}

	{#if isYou}
		<PlayerBadge {started} {player} {playerList} />
	{:else}
		<OpponentBadge {player} />
	{/if}
{/snippet}

{#snippet leftPlayer()}
	{#if isYou}
		<PlayerBadge {started} {player} {playerList} />
	{:else}
		<OpponentBadge {player} />
	{/if}
	<div class="rotate-90">
		<Hand current={player.current} cards={hand} {isYou} {phase} {player} />
	</div>

	<PlayerTable {phase} table={player.table} />

	{#if phase === 1 && vault.length > 0}
		<Vault count={vault.length} {isYou} />
	{/if}
{/snippet}

{#snippet rightPlayer()}
	{#if isYou}
		<PlayerBadge {started} {player} {playerList} />
	{:else}
		<OpponentBadge {player} />
	{/if}

	<div class="rotate-270">
		<Hand {current} cards={hand} {isYou} {phase} {player} />
	</div>

	<PlayerTable {phase} {table} />

	{#if phase === 1 && vault.length > 0}
		<Vault count={vault.length} {isYou} />
	{/if}
{/snippet}

<div class="absolute {positionClass[position]} flex items-center" data-hej={player.name}>
	{#if position === "top"}
		{@render topPlayer()}
	{/if}

	{#if position === "right"}
		{@render rightPlayer()}
	{/if}

	{#if position === "bottom"}
		{@render bottomPlayer()}
	{/if}

	{#if position === "left"}
		{@render leftPlayer()}
	{/if}
</div>
