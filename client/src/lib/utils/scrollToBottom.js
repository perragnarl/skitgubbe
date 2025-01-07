import { tick } from "svelte";

export function scrollToBottom(el) {
	tick().then(() => {
		el.scrollTop = el.scrollHeight;
	});
}
