<script>
	import { socket } from "../stores/socket";
	import Card from "./Card.svelte";

	let { count } = $props();

	function playFromDeck() {
		$socket.emit("play-from-deck");
	}
</script>

<div class="flex justify-center">
	<div>
		<Card {count} hidden onclick={playFromDeck} />
	</div>
</div>
