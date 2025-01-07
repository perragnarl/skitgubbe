<script>
	import { socket } from "../../store";
	import Window from "./Window.svelte";
	import { scrollToBottom } from "../utils/scrollToBottom";

	let messages = [];
	let input = "";
	let chatWindow;

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
		scrollToBottom(chatWindow);
	}
</script>

<Window label="Chatt">
	<div class="overflow-y-auto h-44 flex flex-col gap-1 mb-2" bind:this={chatWindow}>
		{#each messages as { player, playerColor, message }}
			<p>
				<span style="color: {playerColor}">{player}:</span>
				{message}
			</p>
		{/each}
	</div>
	<input
		class="border rounded w-full p-2 border-primary-900 mt-auto"
		type="text"
		placeholder="Skriv ett meddelande..."
		bind:value={input}
		on:keydown={handleInput}
	/>
</Window>
