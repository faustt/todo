import svelte from "@sveltejs/vite-plugin-svelte";
import { readFileSync as readFile } from "fs";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		svelte(),
		VitePWA({
			manifest: {
				short_name: "Todo",
				name: "Todo",
				description: "Keep your todos in order.",
				start_url: "/",
				background_color: "#FBBF24",
				display: "standalone",
				scope: "/",
				theme_color: "#FBBF24",
				orientation: "portrait",
				icons: [
					{
						src: "/icons/icon-196.png",
						type: "image/png",
						sizes: "196x196",
						purpose: "maskable",
					},
					{
						src: "/icons/icon-192.png",
						type: "image/png",
						sizes: "192x192",
						purpose: "any",
					},
					{
						src: "/icons/icon-512.png",
						type: "image/png",
						sizes: "512x512",
						purpose: "any",
					},
				],
				categories: ["time", "management", "scheduling", "memo"],
			},
			workbox: {
				// workbox options for generateSW
			},
		}),
	],
	server: {
		https: {
			cert: readFile(`${__dirname}/certs/cert.pem`),
			key: readFile(`${__dirname}/certs/privkey.pem`),
		},
	},
});
