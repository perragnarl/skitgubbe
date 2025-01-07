import { writable } from "svelte/store";

export let windowStatus = writable({
	log: true,
	chat: true,
	playerList: true,
});
