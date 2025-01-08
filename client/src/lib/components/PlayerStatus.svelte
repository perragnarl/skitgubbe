<script>
	let { ready } = $props();
</script>

{#if ready}
	<span
		class="bg-emerald-700 rounded-full flex items-center justify-center w-7 h-7 text-2xl z-10 text-white"
	>
		<iconify-icon icon="lineicons:check"></iconify-icon>
	</span>
{:else}
<span
		class="bg-red-700 rounded-full flex items-center justify-center w-7 h-7 text-2xl z-10 text-white"
	>
		<iconify-icon icon="lineicons:xmark"></iconify-icon>
	</span>
{/if}
