import { readFileSync as readFile } from "fs";
import { sync as glob } from "glob";
import * as de_DE from "../i18n/de-DE.json";

const regex = /\$_\((?<content>"([^"]|\\")+")/g;

const root = `${__dirname}/..`;
const files = glob("src/**/*.@(ts|svelte)", { root });

const texts = new Set<string>();
for (const file of files) {
    const content = readFile(`${root}/${file}`, "utf8");
    const matches = content.matchAll(regex);
    for (const match of matches) {
        const text = JSON.parse(match.groups!.content);
        if (!(text in de_DE)) {
            texts.add(text);
        }
    }
}

console.log([...texts]);
