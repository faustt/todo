import * as backend from "..";
import events from "./events";
import { invalidate, refresh } from "./getters";

export const processor = backend.events.commands.registerEventProcessor({
	name: "data",
	events,
	hooks: {
		afterKnownEvent() {
			invalidate();
		},
		onSuspend() {
			refresh();
		},
	},
});

export { default as commands } from "./commands";
export { default as getters } from "./getters";
