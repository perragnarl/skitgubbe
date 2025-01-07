<script>
	let { openwindow } = $props();

	function openWindow(key) {
		openwindow(key);
	}
</script>

{#snippet button(label, key)}
	<button
		class="py-2 px-3 font-semibold text-sm rounded-md hover:bg-primary-700 hover:text-white cursor-pointer ease-in-out transition-colors"
		onclick={() => openWindow(key)}
	>
		{label}
	</button>
{/snippet}

<div
	class="fixed top-4 left-4 rounded-md bg-white shadow-md text-primary-700 p-1"
>
	{@render button("Chatt", "chat")}
	{@render button("Logg", "log")}
	{@render button("Spelare", "playerList")}
</div>
