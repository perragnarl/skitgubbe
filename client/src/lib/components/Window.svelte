<script>
	import "iconify-icon";

	let { left = 100, top = 100, label, closable = true, children } = $props();

	let moving = false;
	let open = $state(true);
    let offsetX = 0;
    let offsetY = 0;

	function handleMouseDown(event) {
		moving = true;
        offsetX = left - event.clientX;
        offsetY = top - event.clientY;
	}

	function handleMouseUp() {
		moving = false;
	}

	function handleMouseMove(event) {
		if (moving) {
			left = event.clientX + offsetX;
			top = event.clientY + offsetY;
		}
	}

	function closeWindow() {
		open = false;
	}
</script>

<svelte:window on:mouseup={handleMouseUp} on:mousemove={handleMouseMove} />

{#if open}
	<section
		style="left: {left}px; top: {top}px;"
		class="fixed rounded-md bg-primary-100 shadow-md p-0.5 z-10 hover:shadow-lg text-primary-900"
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			onmousedown={handleMouseDown}
			class="bg-primary-900 font-semibold cursor-move min-w-md rounded-md text-white flex justify-between px-2 py-1"
		>
			<span>{label}</span>
			<button
				class="hover:bg-primary-950 cursor-pointer p-1 rounded-md leading-0 transition-colors ease-in-out"
				onclick={closeWindow}
			>
				<iconify-icon icon="lineicons:close"></iconify-icon>
				<span class="sr-only">Stäng</span>
			</button>
		</div>
		<div class="p-2">
			{@render children()}
		</div>
	</section>
{/if}
