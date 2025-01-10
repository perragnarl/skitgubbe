<script>
    import "iconify-icon";
    import { windowStatus } from "../stores/windows"; 
    
    let { key, left = 10, top = 10, label, children } = $props(); // Default to 10% for both left and top

    let moving = false;
    let offsetX = 0;
    let offsetY = 0;

    function handleMouseDown(event) {
        moving = true;
        const rect = event.target.getBoundingClientRect();
        offsetX = (event.clientX - rect.left) / window.innerWidth * 100;
        offsetY = (event.clientY - rect.top) / window.innerHeight * 100;
    }

    function handleMouseUp() {
        moving = false;
    }

    function handleMouseMove(event) {
        if (moving) {
            left = (event.clientX / window.innerWidth * 100) - offsetX;
            top = (event.clientY / window.innerHeight * 100) - offsetY;
        }
    }

    function closeWindow() {
        windowStatus.update((status) => ({ ...status, [key]: false }));
    }
</script>

<svelte:window on:mouseup={handleMouseUp} on:mousemove={handleMouseMove} />

{#if open}
    <section
        style="left: {left}%; top: {top}%;"
        class="{$windowStatus[key] ? 'block' : 'hidden'} fixed rounded-md bg-primary-100 shadow-md p-0.5 z-10 hover:shadow-lg text-primary-900"
    >
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            onmousedown={handleMouseDown}
            class="bg-primary-900 font-semibold cursor-move min-w-sm rounded-md text-white flex justify-between px-2 py-1"
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