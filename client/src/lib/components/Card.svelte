<script>
	import { suits } from "../utils/suits";

	let {
		suit = "",
		label = "",
		count = 0,
		hidden = false,
		selected = false,
		onclick = null,
		deselect = null,
	} = $props();

	function handleDeselect() {
		deselect();
	}
</script>

<div class="relative rounded-lg border border-gray-950/15">
	<button
		type="button"
		class:border-amber-300={selected}
		class:border-transparent={!selected}
		class:deck-bg={hidden}
		class:bg-white={!hidden}
		class="flex border-4 rounded-lg p-2 h-26 w-18 cursor-pointer hover:bg-primary-50 text-primary-800 shadow-lg"
		{onclick}
	>
		{#if hidden || count > 1}
			{#if count > 1}
				<span
					class="text-2xl font-semibold leading-6 block mx-auto z-10 self-center rounded-md p-1 bg-white"
					>{count}</span
				>
			{/if}
		{:else}
			<div class="absolute flex flex-col items-center top-4 left-4">
				<span class="text-xl">{label}</span>
				<span class="text-2xl" style="color: {suits[suit].color}">
					{suits[suit].symbol}
				</span>
			</div>
		{/if}
		
	</button>
	{#if selected}
		<button
			class="absolute top-1 right-1 flex justify-center items-center h-6 w-6 rounded-full bg-primary-600 text-white hover:bg-primary-700 cursor-pointer"
			onclick={handleDeselect}
		>
			<span class="sr-only">Avmarkera</span>
			<iconify-icon icon="mdi:close"></iconify-icon>
		</button>
	{/if}
</div>
