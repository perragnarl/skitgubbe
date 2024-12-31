<script>
	let { suit, label, hidden = false, onclick = null } = $props();

	let suits = {
		hearts: { symbol: "♥", color: "red" },
		diamonds: { symbol: "♦", color: "red" },
		clubs: { symbol: "♣", color: "black" },
		spades: { symbol: "♠", color: "black" },
	};
</script>

<button
	type="button"
	class="inline-flex relative border border-black rounded p-2 h-32 w-22 cursor-pointer hover:shadow-lg"
	{onclick}
>
	{#if hidden}
		<div
			class="absolute left-0 right-0 top-0 bottom-0 bg-gray-200 rounded"
		></div>
	{:else}
		<div class="absolute flex flex-col items-center top-4 left-4">
			<span class="text-2xl">{label}</span>
			<span class="text-3xl" style="color: {suits[suit].color}">
				{suits[suit].symbol}
			</span>
		</div>
		<!-- <div
			class="absolute flex flex-col items-center bottom-4 right-4 rotate-180"
		>
			<span class="text-2xl">{label}</span>
			<span class="text-3xl" style="color: {suits[suit].color}"
				>{suits[suit].symbol}</span
			>
		</div> -->
	{/if}
</button>
