<script>
	import { socket } from "../stores/socket";
	import Card from "./Card.svelte";

	let { count, playerList, playerId } = $props();

	function playFromDeck() {
		const player = playerList.find((player) => player.id === playerId);
		if (!player.current) return;
		
		$socket.emit("play-from-deck");
	}
</script>

<div class="flex justify-center">
	<div>
		<Card {count} hidden onclick={playFromDeck} />
	</div>
</div>
