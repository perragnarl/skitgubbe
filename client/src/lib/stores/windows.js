import { writable } from "svelte/store";

export let windowStatus = writable({
	log: true,
	chat: false,
	playerList: true,
});
