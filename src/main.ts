import "./global.postcss";
import App from "./App.svelte";
// @ts-ignore
import { add } from "./components/Toasts.svelte";
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
    onNeedRefresh() {
        if (confirm("There is a new version available. Want to update?")) {
            updateSW(true);
        }
    },
    onOfflineReady() {
        add({
            intent: "info",
            text: "You can now work offline!",
        });
    },
});

const app = new App({
    target: document.getElementById("app"),
});

export default app;
