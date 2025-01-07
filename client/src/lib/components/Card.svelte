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
	class="inline-flex bg-white relative border-2 border-primary-900 rounded-lg p-2 h-32 w-22 cursor-pointer hover:border-primary-500 text-primary-900 {selected ? 'border-2 border-blue-500' : ''}"
	{onclick}
>
	{#if hidden || count > 1}
		<div
			class="absolute left-0 right-0 top-0 bottom-0 bg-gray-200 rounded-lg"
		></div>
		{#if count > 1}
			<span class="text-4xl z-10 self-center w-full">{count}</span>
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
