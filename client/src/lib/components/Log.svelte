<script>
	import { socket } from "../../store";
	import BottomBox from "./BottomBox.svelte";

	let log = ["Välkommen till skitgubbe!"];

	$socket.on("new-player", (player) => {
		log = [...log, `${player.name} har anslutit till spelet.`];
	});

	$socket.on("player-left", (player) => {
		log = [...log, `${player.name} har lämnat spelet.`];
	});

	$socket.on("full", () => {
		log = [...log, "Spelet är fullt."];
	});

	$socket.on("name-change", (names) => {
		log = [...log, `${names.oldName} bytte namn till ${names.newName}.`];
	});

	$socket.on("ready-change", (player) => {
		log = [
			...log,
			`${player.name} är ${player.ready ? "redo" : "inte redo"}.`,
		];
	});

	$socket.on("all-ready", () => {
		log = [...log, "Alla spelare är redo!"];
	});

	$socket.on("start-game", () => {
		log = [...log, "Spelet har startat!"];
	});
</script>

<BottomBox title="Logg">
	<div class="text-xs flex flex-col gap-1">
		{#each log as entry}
			<p>{entry}</p>
		{/each}
	</div>
</BottomBox>
