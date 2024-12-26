<script>
	import { socket } from "../../store";
	import BottomBox from "./BottomBox.svelte";

	let messages = [];
	let input = "";

	$socket.on("chat", (player, msg) => {
		messages = [
			...messages,
			{
				player: player.name,
				playerColor: player.color,
				message: msg,
			},
		];
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
</script>

<BottomBox title="Chatt">
	<div class="flex flex-col h-full">
		<div class="h-full flex flex-col gap-1 overflow-y-auto">
			{#each messages as { player, playerColor, message }}
                <p>
                    <span style="color: {playerColor}">{player}:</span> {message}
                </p>
			{/each}
		</div>
		<input
			class="border rounded w-full p-2 border-dashed mt-auto"
			type="text"
			placeholder="Skriv ett meddelande..."
			bind:value={input}
			on:keydown={handleInput}
		/>
	</div>
</BottomBox>
