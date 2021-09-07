import "./global.postcss";
import App from "./App.svelte";
// @ts-ignore
import { add } from "./components/Toasts.svelte";
import { registerSW } from "virtual:pwa-register";
import { _ } from "./i18n";
import { get } from "svelte/store";

const updateSW = registerSW({
    onNeedRefresh() {
        if (confirm("There is a new version available. Want to update?")) {
            updateSW(true);
        }
    },
    onOfflineReady() {
        add({
            intent: "info",
            text: get(get(_)("You can now work offline!")),
        });
    },
});

const app = new App({
    target: document.getElementById("app"),
    intro: true,
});

export default app;
