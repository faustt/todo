import { defineConfig } from "vite";
import svelte from "@sveltejs/vite-plugin-svelte";
import { readFileSync as readFile } from "fs";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [svelte()],
    server: {
        https: {
            cert: readFile(`${__dirname}/certs/cert.pem`),
            key: readFile(`${__dirname}/certs/privkey.pem`),
        },
    },
});
