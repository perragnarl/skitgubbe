<script>
	let { title, children } = $props();
</script>

<div class="border border-black border-dashed p-2 max-w-2xl font-mono text-sm rounded my-10 h-64 overflow-y-auto flex flex-col">
<strong class="block mb-2">{title}</strong>
	<div class="h-full">
		{@render children()}
	</div>
</div>
