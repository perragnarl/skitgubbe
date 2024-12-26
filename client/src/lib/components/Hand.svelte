<script>
	let { current = $bindable(), children } = $props();
</script>

<div class="inline-flex p-2 gap-3 rounded {current ? 'border-2 border-black' : ''}">
	{@render children()}
</div>
