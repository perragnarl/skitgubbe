<script>
	let { name, current } = $props();
</script>

<div class="inline-flex flex-col self-center">
	<div
		class:border-amber-300={current}
		class:border-transparent={!current}
		class="flex items-stretch gap-1 border-4 bg-primary-50 px-3 py-1.5 rounded-md shadow-md relative z-10"
	>
		<p class="font-semibold px-2 py-0.5 text-center">
			{name}
		</p>
	</div>
</div>
