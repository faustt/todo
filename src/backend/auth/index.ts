import * as backend from "..";
import events from "./events";

backend.events.commands.registerEventProcessor({
	name: "auth",
	events,
});

export { default as commands } from "./commands";
