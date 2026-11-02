import fs from "node:fs";
import path from "node:path";
import { findTodos, loadContent, siteUrl, type Content, type SiteMode, type Todo } from "./content.ts";
import { home, notFoundPage, projectPage, type PageOut } from "./pages.ts";
import { headers, robots, sitemap, type RenderContext } from "./seo.ts";

export interface ExtraFile {
	fileName: string;
	source: string | Uint8Array;
}

export interface BuiltSite {
	pages: PageOut[];
	files: ExtraFile[];
	todos: Todo[];
}

export function siteMode(viteMode: string): SiteMode {
	if (viteMode === "development" || viteMode === "staging" || viteMode === "production") return viteMode;
	throw new Error(`Unknown mode "${viteMode}". Use development, staging or production.`);
}

export function renderPages(ctx: RenderContext): PageOut[] {
	return [
		home(ctx),
		...ctx.content.projects.map((p) => projectPage(ctx, p)),
		notFoundPage(ctx),
	];
}

export function buildSite(o: { root: string; mode: SiteMode; date?: Date; content?: Content }): BuiltSite {
	const content = o.content ?? loadContent(o.root);
	const todos = findTodos(content);
	if (o.mode === "production" && todos.length) {
		throw new Error(
			`Production build blocked: ${todos.length} TODO(s) left in content/.\n` +
				todos.map((t) => `  - ${t.where}: ${t.text}`).join("\n"),
		);
	}
	const ctx: RenderContext = { content, mode: o.mode, url: siteUrl(content, o.mode), date: o.date ?? new Date() };
	const pages = renderPages(ctx);
	const files: ExtraFile[] = [
		{ fileName: "sitemap.xml", source: sitemap(ctx, pages.filter((p) => p.route !== "/404").map((p) => p.route)) },
		{ fileName: "robots.txt", source: robots(ctx) },
		{ fileName: "_headers", source: headers(ctx) },
	];
	const filesDir = path.join(o.root, "content", "files");
	for (const name of fs.readdirSync(filesDir)) {
		files.push({ fileName: `files/${name}`, source: fs.readFileSync(path.join(filesDir, name)) });
	}
	return { pages, files, todos };
}
