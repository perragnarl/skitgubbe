<script>
	import { socket } from "../../store";
	import BottomBox from "./BottomBox.svelte";

	let messages = [];
	let input = "";
	let bottomBox;

	$socket.on("chat", (player, msg) => {
		addToChat(player, msg);
	});

	function handleInput(event) {
		if (event.key === "Enter") {
			$socket.emit("chat", input);
			input = "";
			return;
		}

		if (event.key === "Escape") {
			input = "";
		}
	}

	function addToChat(player, msg) {
		messages = [
			...messages,
			{
				player: player.name,
				playerColor: player.color,
				message: msg,
			},
		];
		bottomBox.scrollToBottom();
	}
</script>

<BottomBox title="Chatt" bind:this={bottomBox}>
	{#each messages as { player, playerColor, message }}
		<p>
			<span style="color: {playerColor}">{player}:</span>
			{message}
		</p>
	{/each}
	{#snippet bottom()}
		<input
			class="border rounded w-full p-2 border-dashed mt-auto"
			type="text"
			placeholder="Skriv ett meddelande..."
			bind:value={input}
			on:keydown={handleInput}
		/>
	{/snippet}
</BottomBox>
