// Vite plugin that renders every page from content/ to real HTML.
// - build: each page is a Vite HTML entry, so CSS, JS, fonts and images
//   referenced from it are bundled and hashed as usual; sitemap, robots,
//   _headers and content/files/* are emitted next to them.
// - dev: pages are re-rendered on every request, and editing anything in
//   content/ reloads the browser.
import fs from "node:fs";
import path from "node:path";
import { normalizePath, type Plugin } from "vite";
import { buildSite, siteMode, type BuiltSite } from "./build.ts";
import type { SiteMode } from "./content.ts";

/** TODO warnings already printed; Vite may load the config more than once per build. */
const reported = new Set<string>();

export function sitePlugin(): Plugin {
	let root = process.cwd();
	let mode: SiteMode = "development";
	let built: BuiltSite | undefined;
	const pageById = new Map<string, string>();

	const render = (): BuiltSite => buildSite({ root, mode });

	return {
		name: "datum:site",
		enforce: "pre",

		config(config, env) {
			root = path.resolve(config.root ?? process.cwd());
			mode = siteMode(env.mode);
			if (env.command !== "build") return;
			built = render();
			for (const t of built.todos) {
				const line = `  TODO  ${t.where}: ${t.text}`;
				if (!reported.has(line)) console.warn(line);
				reported.add(line);
			}
			const input: Record<string, string> = {};
			for (const page of built.pages) {
				const id = normalizePath(path.join(root, page.file));
				pageById.set(id, page.html);
				input[page.file.replace(/\/?index\.html$|\.html$/, "") || "index"] = id;
			}
			return { build: { rollupOptions: { input } } };
		},

		resolveId(id) {
			const normalized = normalizePath(id);
			return pageById.has(normalized) ? normalized : null;
		},

		load(id) {
			return pageById.get(normalizePath(id)) ?? null;
		},

		generateBundle() {
			for (const file of built?.files ?? []) {
				this.emitFile({ type: "asset", fileName: file.fileName, source: file.source });
			}
		},

		configureServer(server) {
			const contentDir = path.join(root, "content");
			server.watcher.add(contentDir);
			server.watcher.on("all", (_event, file) => {
				if (normalizePath(file).startsWith(normalizePath(contentDir))) server.ws.send({ type: "full-reload" });
			});

			server.middlewares.use(async (req, res, next) => {
				const url = new URL(req.url ?? "/", "http://localhost");
				const pathname = decodeURIComponent(url.pathname);
				try {
					if (pathname.startsWith("/files/")) {
						const file = path.join(contentDir, "files", path.basename(pathname));
						if (!fs.existsSync(file)) return next();
						const types: Record<string, string> = { ".pdf": "application/pdf", ".vtt": "text/vtt; charset=utf-8" };
						res.setHeader("Content-Type", types[path.extname(file)] ?? "application/octet-stream");
						res.end(fs.readFileSync(file));
						return;
					}
					if (/^\/(@|__|src\/|node_modules\/|cdn-cgi\/)/.test(pathname)) return next();
					if (path.extname(pathname) && !pathname.endsWith(".html")) return next();
					const site = render();
					const extra = site.files.find((f) => `/${f.fileName}` === pathname);
					if (extra) {
						res.setHeader("Content-Type", "text/plain; charset=utf-8");
						res.end(extra.source);
						return;
					}
					const route = pathname.endsWith("/") ? pathname : `${pathname}/`;
					const page = site.pages.find((p) => p.route === route) ?? site.pages.find((p) => p.route === "/404");
					if (!page) return next();
					res.statusCode = page.route === "/404" ? 404 : 200;
					res.setHeader("Content-Type", "text/html; charset=utf-8");
					res.end(await server.transformIndexHtml(pathname, page.html));
				} catch (error) {
					next(error);
				}
			});
		},
	};
}
