<script>
	import Card from "./Card.svelte";

	let { count, onclick } = $props();
</script>

<div class="flex justify-center">
	<div>
		<Card {count} hidden {onclick} />
	</div>
</div>
