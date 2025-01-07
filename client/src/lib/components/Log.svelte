<script>
	import { socket } from "../stores/socket"; 
	import { scrollToBottom } from "../utils/scrollToBottom";
	import Window from "./Window.svelte";

	let log = $state(["Välkommen till skitgubbe!"]);
	let logWindow;

	$socket.on("new-player", (player) => {
		addLogEntry(`${player.name} har anslutit till spelet.`);
	});

	$socket.on("player-left", (player) => {
		addLogEntry(`${player.name} har lämnat spelet.`);
	});

	$socket.on("full", () => {
		addLogEntry("Spelet är fullt.");
	});

	$socket.on("game-started", (phase) => {
		addLogEntry(`Spelet har startat och är i fas ${phase}. Vänta till spelet är avslutat.`);
	});

	$socket.on("name-change", (names) => {
		addLogEntry(`${names.oldName} bytte namn till ${names.newName}.`);
	});

	$socket.on("ready-change", (player) => {
		addLogEntry(
			`${player.name} är ${player.ready ? "redo" : "inte redo"}.`,
		);
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
		addLogEntry(
			`${players.map((player) => player.name).join(", ")} spelade lika höga kort och får spela igen.`,
		);
	});

	$socket.on("phase-change", (phase) => {
		addLogEntry(`Fas ${phase - 1} avslutad, startar fas ${phase}`);
	});

	$socket.on("reset-game", () => {
		addLogEntry("Spelet har återställts.");
	});

	function addLogEntry(entry) {
		log = [...log, entry];
		scrollToBottom(logWindow);
	}
</script>

<Window label="Logg" key="log">
	<div class="text-xs flex flex-col gap-1 h-44" bind:this={logWindow}>
		{#each log as entry}
			<p class="border-b border-gray-200 pb-1">{entry}</p>
		{/each}
	</div>
</Window>
