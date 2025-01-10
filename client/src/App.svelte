<script>
	import { io } from "socket.io-client";
	import { socket } from "./lib/stores/socket";

	const protocol = window.location.protocol;
	const hostname = window.location.hostname;
	const port = import.meta.env.PROD ? window.location.port : 1337;

	$socket = io(`${protocol}//${hostname}:${port}`);

	import Chat from "./lib/components/Chat.svelte";
	import Log from "./lib/components/Log.svelte";
	import PlayerList from "./lib/components/PlayerList.svelte";
	import Scoreboard from "./lib/components/Scoreboard.svelte";
	import Game from "./lib/components/Game.svelte";
	import Controls from "./lib/components/Controls.svelte";
	import Status from "./lib/components/Status.svelte";
	import toast, { Toaster } from "svelte-5-french-toast";
	import Countdown from "./lib/components/Countdown.svelte";

	let phase = $state(0);
	let onGoing = $state(false);
	let playerId = $state("");
	let playerList = $state([]);
	let countdown = $state(-1);
	let started = $state(false);

	$socket.on("start-game", (startPhase) => {
		started = true;
		phase = startPhase;
	});

	$socket.on("phase-change", (newPhase) => {
		phase = newPhase;
	});

	$socket.on("connection", (currentPlayerId, activePlayerList, isStarted) => {
		console.log("Connected to server");

		playerId = currentPlayerId;
		playerList = activePlayerList;
		onGoing = isStarted;
	});

	$socket.on("update-players", (newList) => {
		
		playerList = newList;
		console.log("update-players", playerList);
	});

	$socket.on("countdown-aborted", () => {
		countdown = -1;
	});

	$socket.on("game-over", (gameScoreboard) => {
		console.log("game-over", gameScoreboard);

		countdown = -1;
	});

	$socket.on("invalid-cards", () => {
		toast.error("Ogiltiga kort eller kombination");
	});

	$socket.on("no-pick-up", () => {
		toast.error("Det går inte att plocka upp");
	});
</script>

<main
	class="p-4 relative flex flex-col justify-between h-screen select-none"
>
	<Toaster position="bottom-left" />

	<Controls />

	<Log />
	<Chat />
	<PlayerList {playerList} />
	<Scoreboard />

	<Status {onGoing} {phase} />

	<Game {playerId} {playerList} {started} {phase} />

	<Countdown />
</main>
