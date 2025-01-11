<script>
	import { socket } from "../stores/socket";
	import Card from "./Card.svelte";
	import Vault from "./Vault.svelte";

	let { isYou = false, phase, player = null } = $props();

	let selectedCards = $state([]);
	let lastClickTime = $state(0);

	const debounceDelay = 5000;

	$socket.on("invalid-cards", () => {
		selectedCards = [];
	});

	function handleClick(card) {
		if (!player.current || !isYou) return;
		const isSelected = selectedCards.includes(card);

		const currentTime = Date.now();
		if (phase === 1) {
			if (currentTime - lastClickTime < debounceDelay) {
				return;
			}
			lastClickTime = currentTime;
			$socket.emit("play-card", card);
			return;
		}

		if (isSelected) {
			$socket.emit("play-cards", selectedCards);
			selectedCards = [];
		} else {
			selectedCards = [...selectedCards, card];
		}
	}

	function deselect(card) {
		selectedCards = selectedCards.filter((c) => c !== card);
	}

	function pickUp() {
		console.log("pick-up", player);

		$socket.emit("pick-up", player);
	}
</script>

<div class="flex flex-col justify-center items-center p-2 gap-3 rounded">
	<div class="flex rounded-2xl gap-1">
		{#each player.hand as card}
			{@const selected = selectedCards.includes(card)}
			{#if isYou}
				<div>
					<Card
						suit={card.suit}
						{selected}
						label={card.label}
						onclick={() => handleClick(card)}
						deselect={() => deselect(card)}
					/>
				</div>
			{:else}
				<div>
					<Card suit={card.suit} label={card.label} hidden />
				</div>
			{/if}
		{/each}

		{#if phase === 1 && player.vault.length > 0}
			<div class="ml-4">
				<Vault count={player.vault.length} />
			</div>
		{/if}
	</div>
	{#if isYou && phase === 2}
		<button
			onclick={pickUp}
			disabled={!player.current}
			class="bg-red-700 cursor-pointer hover:bg-red-800 text-white font-semibold px-3 py-2 text-sm self-center rounded-md"
		>
			Ta upp
		</button>
	{/if}
</div>
