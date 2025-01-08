<script>
	import { suits } from "../utils/suits";

	let {
		suit = "",
		label = "",
		count = 0,
		hidden = false,
		selected = false,
		onclick = null,
	} = $props();
</script>

<button
	type="button"
	class="inline-flex {hidden
		? 'deck-bg'
		: 'bg-white'} relative border-2 border-primary-800 rounded-lg p-2 h-32 w-22 cursor-pointer hover:bg-primary-50 text-primary-800 shadow-md {selected
		? 'border-2 border-blue-500'
		: ''}"
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
			<span class="text-2xl">{label}</span>
			<span class="text-3xl" style="color: {suits[suit].color}">
				{suits[suit].symbol}
			</span>
		</div>
	{/if}
</button>
