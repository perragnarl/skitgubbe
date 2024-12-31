<script>
	import { tick } from "svelte";
	import BottomBox from "./BottomBox.svelte";

	let { player = $bindable(), started, changename } = $props();

	let edit = $state(false);
	let input = $state(null);

	function saveName() {
		changename(player.name);
		edit = false;
	}

	async function editName() {
		edit = true;
		await tick();
		input.focus();
	}

	function handleInput(event) {
		if (event.key === "Enter") {
			saveName();
		}
	}
</script>

<BottomBox title="Du">
	{#if edit && !started}
		<div class="flex justify-between items-center">
			<input
				class="border border-dashed px-2 py-0.5 rounded"
				type="text"
				bind:value={player.name}
				onkeydown={handleInput}
				bind:this={input}
			/>
			<button
				class="cursor-pointer disabled:opacity-50"
				onclick={saveName}>💾</button
			>
		</div>
	{:else}
		<div class="flex justify-between items-center">
			<p>
				Namn:
				<span style="color: {player.color}">
					{player.name}
				</span>
			</p>
			<button
				class="cursor-pointer disabled:opacity-50"
				disabled={started}
				onclick={editName}
			>
				✍️
			</button>
		</div>
	{/if}
	<p>Redo: {player.ready ? "Ja" : "Nej"}</p>
	<p>Din tur: {player.current ? "Ja" : "Nej"}</p>
</BottomBox>
