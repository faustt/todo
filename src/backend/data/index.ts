import * as backend from "..";
import events from "./events";
import { refresh } from "./getters";

backend.events.commands.registerEventProcessor({
    name: "data",
    events,
    hooks: {
        afterKnownEvent() {
            refresh();
        },
    },
});

export { default as commands } from "./commands";
export { default as getters } from "./getters";
