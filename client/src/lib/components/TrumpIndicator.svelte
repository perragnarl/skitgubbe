<script>
	import { suits } from "../utils/suits";

	let { trumpSuit } = $props();
</script>

{#if trumpSuit}
	<div class="inline-flex flex-col self-center">
		<div class="bg-primary-50 px-4 py-2 rounded-md shadow-md">
			<p class="font-semibold text-center">
				Trumf <br>
				<span style="color: {suits[trumpSuit].color};" class="text-4xl">
					{suits[trumpSuit].symbol}
				</span>
			</p>
		</div>
	</div>
{/if}
