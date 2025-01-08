<script>
	import Card from "./Card.svelte";

	let { count } = $props();
</script>

<div class="flex justify-center fixed bottom-6 right-6">
	<div>
		<Card hidden {count} />
	</div>
</div>
