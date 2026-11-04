import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import { sitePlugin } from "./src/site/plugin.ts";

// "pages" mode builds the plain static site for GitHub Pages into dist/
// (npm run build:pages); every other mode goes through Cloudflare's plugin (cf).
export default defineConfig(({ mode }) => ({
	plugins: mode === "pages" ? [sitePlugin()] : [sitePlugin(), cloudflare()],
	build: {
		// Keep fonts and images as separate, long-cacheable files.
		assetsInlineLimit: 0,
		...(mode === "pages" ? { outDir: "dist", emptyOutDir: true } : {}),
	},
	server: { port: 5173, strictPort: true },
	preview: { port: 4173, strictPort: true },
}));
