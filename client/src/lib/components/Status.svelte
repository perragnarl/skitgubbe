<script>
	let { onGoing, phase } = $props();
</script>

<div class="fixed right-4 top-4 text-white text-sm">
	{#if onGoing}
		Spelet pågår, fas {phase}
	{/if}
</div>
