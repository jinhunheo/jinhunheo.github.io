import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import { sitePlugin } from "./src/site/plugin.ts";

export default defineConfig({
	plugins: [sitePlugin(), cloudflare()],
	build: {
		// Keep fonts and images as separate, long-cacheable files.
		assetsInlineLimit: 0,
	},
	server: { port: 5173, strictPort: true },
});
