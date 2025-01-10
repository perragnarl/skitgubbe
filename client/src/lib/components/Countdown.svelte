<script>
	import { socket } from "../stores/socket";

	let countdown = $state(-1);

	$socket.on("countdown", (timeleft) => {
		countdown = timeleft;
	});
</script>

{#if countdown > 0}
	<span
		class="text-center mb-4 text-3xl text-white absolute top-1/2 -translate-y-1/2 left-1/2 transform -translate-x-1/2"
	>
		Spelet startar om {countdown}
		{countdown === 1 ? "sekund" : "sekunder"}
	</span>
{/if}
