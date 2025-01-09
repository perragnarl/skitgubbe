<script>
	import Card from "./Card.svelte";

	let { count, isYou = false } = $props();

	let position = isYou ? "bottom-6 right-6" : "top-6 right-6";
</script>

<div class="flex justify-center fixed {position}">
	<div>
		<Card hidden {count} />
	</div>
</div>
