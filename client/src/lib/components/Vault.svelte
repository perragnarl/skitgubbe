<script>
	import Card from "./Card.svelte";

	let { count } = $props();
</script>

<div class="flex justify-center">
	<div>
		<Card hidden {count} />
	</div>
</div>
