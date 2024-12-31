<script>
	import { tick } from "svelte";

	let { title, bottom = null, children } = $props();

	let containerEl;

	export function scrollToBottom() {
		tick().then(() => {
			containerEl.scrollTop = containerEl.scrollHeight;
		});
	}
</script>

<div
	class="border border-black border-dashed p-2 font-mono text-sm rounded my-4 flex flex-col h-64"
>
	<strong class="block mb-2">{title}</strong>
	<div class="overflow-y-auto" bind:this={containerEl}>
		{@render children()}
	</div>
	{#if bottom}
		<div class="mt-auto pt-2">
			{@render bottom()}
		</div>
	{/if}
</div>
