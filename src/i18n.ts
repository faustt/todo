import { writable } from "svelte/store";
import de_DE from "../i18n/de-DE.json";

export const _ = writable(__);
export function changeLanguage(language: string) {
    language = language.toLowerCase().trim();

    if (language === "de" || language.startsWith("de-")) {
        translations = de_DE;
    } else {
        translations = {};
    }
}

function __(text: string, parameters?: Record<string, any>) {
    if (text in translations) {
        return translations[text];
    }

    console.warn(`Could not find translation for ${text}`);
    return text;
}

let translations: Record<string, any> = {};

if (import.meta.hot) {
    import.meta.hot.accept("../i18n/de-DE.json", (mod) => {
        translations = mod.default;
        _.set(__);
    });
}
