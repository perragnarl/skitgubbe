<script>
	import { socket } from "../../store";
	import BottomBox from "./BottomBox.svelte";

	let log = ["Välkommen till skitgubbe!"];
	let bottomBox;

	$socket.on("new-player", (player) => {
		addLogEntry(`${player.name} har anslutit till spelet.`);
	});

	$socket.on("player-left", (player) => {
		addLogEntry(`${player.name} har lämnat spelet.`);
	});

	$socket.on("full", () => {
		addLogEntry("Spelet är fullt.");
	});

	$socket.on("name-change", (names) => {
		addLogEntry(`${names.oldName} bytte namn till ${names.newName}.`);
	});

	$socket.on("ready-change", (player) => {
		addLogEntry(`${player.name} är ${player.ready ? "redo" : "inte redo"}.`);
	});

	$socket.on("all-ready", () => {
		addLogEntry("Alla spelare är redo!");
	});

	$socket.on("start-game", () => {
		addLogEntry("Spelet har startat!");
	});

	$socket.on("round-winner", (player) => {
		addLogEntry(`${player.name} spelade högsta kortet och fick alla kort.`);
	});

	$socket.on("battle-round", (players) => {
		addLogEntry(`${players.map((player) => player.name).join(", ")} spelade lika höga kort och får spela igen.`);
	})

	$socket.on("phase-change", (phase) => {
		addLogEntry(`Fas ${phase - 1} avslutad, startar fas ${phase}`);
	});

	$socket.on("reset-game", () => {
		addLogEntry("Spelet har återställts.");
	});

	function addLogEntry(entry) {
		log = [...log, entry];
		bottomBox.scrollToBottom();
	}
</script>

<BottomBox title="Logg" bind:this={bottomBox}>
	<div class="text-xs flex flex-col gap-1">
		{#each log as entry}
			<p class="border-b border-gray-200 pb-1">{entry}</p>
		{/each}
	</div>
</BottomBox>
