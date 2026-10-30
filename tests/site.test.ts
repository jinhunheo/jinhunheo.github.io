import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { buildSite, renderPages } from "../src/site/build.ts";
import { figureSpans } from "../src/site/components.ts";
import { findTodos, loadContent, type Content } from "../src/site/content.ts";
import type { RenderContext } from "../src/site/seo.ts";
import { THEME_SCRIPT, THEME_SCRIPT_HASH } from "../src/site/theme.ts";

const root = path.resolve(import.meta.dirname, "..");
const content = loadContent(root);
const date = new Date("2026-10-25T12:00:00Z");
const staging: RenderContext = { content, mode: "staging", url: "https://staging.example.workers.dev", date };
const pages = renderPages(staging);

const all = (html: string, re: RegExp): RegExpExecArray[] => [...html.matchAll(new RegExp(re, "g"))];
const attr = (tag: string, name: string): string | undefined => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];

/** Content with every TODO filled in, as it will be at launch. */
function launchReady(): Content {
	const c = structuredClone(content);
	c.site.urls.production = "https://example.com";
	return c;
}

describe("content", () => {
	test("projects are ordered and every category is labelled", () => {
		assert.deepEqual(
			content.projects.map((p) => p.order),
			[...content.projects.map((p) => p.order)].sort((a, b) => a - b),
		);
		for (const p of content.projects) assert.ok(content.site.categories[p.category], p.slug);
	});

	test("every project has a featured metric for the projects list", () => {
		for (const p of content.projects) assert.ok(p.metrics.some((m) => m.featured), p.slug);
	});

	test("TODOs are found, so a production build can refuse them", () => {
		const todos = findTodos(content);
		assert.ok(todos.some((t) => t.where === "site.yaml.urls.production"));
		assert.equal(findTodos(launchReady()).length, 0);
	});
});

describe("images", () => {
	test("manifest matches content/media", () => {
		const mediaDir = path.join(root, "content", "media");
		const files = fs.readdirSync(mediaDir).filter((f) => /\.(jpe?g|png)$/.test(f));
		assert.deepEqual(Object.keys(content.images).sort(), files.map((f) => f.replace(/\.[^.]+$/, "")).sort());
		for (const file of files) {
			const name = file.replace(/\.[^.]+$/, "");
			const hash = createHash("sha256").update(fs.readFileSync(path.join(mediaDir, file))).digest("hex").slice(0, 16);
			assert.equal(content.images[name]?.source, hash, `${file} changed: run npm run images`);
		}
	});

	test("every generated variant exists", () => {
		for (const [name, entry] of Object.entries(content.images)) {
			for (const v of [...entry.avif, ...entry.webp]) {
				assert.ok(fs.existsSync(path.join(root, "src", "generated", "img", v.file)), `${name}: ${v.file}`);
			}
		}
	});

	test("media files carry no EXIF or GPS metadata", () => {
		for (const file of fs.readdirSync(path.join(root, "content", "media"))) {
			const bytes = fs.readFileSync(path.join(root, "content", "media", file));
			assert.equal(bytes.includes(Buffer.from("Exif\0\0")), false, file);
		}
	});

	test("figures tile the 12-column grid in full rows", () => {
		for (const p of content.projects) {
			const spans = figureSpans(content, p.figures);
			const whole = spans.reduce((sum, s) => sum + s, 0);
			if (spans.length > 1) assert.equal(whole % 12, 0, `${p.slug}: ${spans.join(",")}`);
		}
	});

	test("social preview images are current for every page", () => {
		const og = JSON.parse(fs.readFileSync(path.join(root, "src", "generated", "og.json"), "utf8")) as Record<
			string,
			{ title: string; sheet: string }
		>;
		for (const page of pages) {
			assert.ok(fs.existsSync(path.join(root, "public", "og", `${page.og.id}.jpg`)), page.og.id);
			if (page.route === "/404") continue;
			assert.equal(og[page.og.id]?.title, page.og.title, `${page.og.id} is stale: run npm run images`);
		}
	});
});

describe("rendered pages", () => {
	const routes = new Set(pages.map((p) => p.route));
	const publicFiles = new Set(fs.readdirSync(path.join(root, "public"), { recursive: true }).map((f) => `/${String(f).replaceAll("\\", "/")}`));

	for (const page of pages) {
		describe(page.route, () => {
			const { html } = page;

			test("is a complete English document with one h1", () => {
				assert.match(html, /^<!doctype html><html lang="en">/);
				assert.equal(all(html, /<h1[\s>]/).length, 1);
			});

			test("headings never skip a level", () => {
				let previous = 1;
				for (const [, level] of all(html, /<h([1-6])[\s>]/)) {
					const n = Number(level);
					assert.ok(n <= previous + 1, `h${previous} followed by h${n}`);
					previous = n;
				}
			});

			test("has a title, description and social preview", () => {
				const title = /<title>([^<]+)<\/title>/.exec(html)?.[1] ?? "";
				assert.ok(title.length > 10 && title.length <= 65, `title length ${title.length}`);
				const description = /<meta name="description" content="([^"]+)"/.exec(html)?.[1] ?? "";
				assert.ok(description.length >= 50 && description.length <= 200, `description length ${description.length}`);
				assert.match(html, /<meta property="og:image" content="https:\/\/[^"]+\/og\/[a-z0-9-]+\.jpg"/);
				if (page.route !== "/404") assert.match(html, new RegExp(`<link rel="canonical" href="${staging.url}${page.route}">`));
			});

			test("staging pages are marked noindex", () => {
				assert.match(html, /<meta name="robots" content="noindex">/);
			});

			test("structured data is valid JSON", () => {
				for (const [, json] of all(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/)) {
					assert.doesNotThrow(() => JSON.parse(json ?? ""));
				}
			});

			test("every image has alt text and intrinsic size", () => {
				// Home card images sit in an aria-hidden link next to the visible
				// title, so they are decorative: empty alt is correct there.
				const decorative = all(html, /<a class="card__media"[^>]*aria-hidden="true">[\s\S]*?<\/a>/).map((m) => m[0]);
				for (const block of decorative) {
					for (const [tag] of all(block, /<img\s[^>]*>/)) assert.equal(attr(tag, "alt"), "", tag.slice(0, 80));
				}
				const content = decorative.reduce((h, block) => h.replace(block, ""), html);
				for (const [tag] of all(content, /<img\s[^>]*>/)) {
					assert.ok(attr(tag, "alt")?.trim(), `missing alt: ${tag.slice(0, 80)}`);
				}
				for (const [tag] of all(html, /<img\s[^>]*>/)) {
					assert.ok(Number(attr(tag, "width")) > 0 && Number(attr(tag, "height")) > 0, `missing size: ${tag.slice(0, 80)}`);
				}
			});

			test("internal links resolve", () => {
				for (const [, href] of all(html, /\shref="(\/[^"#]*)"/)) {
					if (!href || href.startsWith("/src/")) continue;
					const ok =
						routes.has(href) ||
						publicFiles.has(href) ||
						(href.startsWith("/files/") && path.basename(href) in content.fileSizes);
					assert.ok(ok, `broken link ${href}`);
				}
			});

			test("no inline styles or scripts that the CSP would block", () => {
				assert.doesNotMatch(html, /\sstyle="/);
				const inline = all(html, /<script(?![^>]*(type="module" src=|type="application\/ld\+json"))[^>]*>([\s\S]*?)<\/script>/);
				assert.deepEqual(inline.map((m) => m[2]), [THEME_SCRIPT], "only the theme script may be inline");
			});

			test("has the dark-mode toggle and footer contact icons", () => {
				assert.match(html, /<button class="theme-toggle"[^>]*aria-pressed="false"/);
				assert.match(html, /href="https:\/\/www\.linkedin\.com\/in\/[^"]+"[^>]*aria-label="[^"]+LinkedIn"/);
				assert.match(html, /href="mailto:[^"]+" data-copy-email="[^"]+"/);
				assert.doesNotMatch(html, /class="todo"/);
			});
		});
	}
});

describe("build modes", () => {
	test("staging output keeps search engines out", () => {
		const site = buildSite({ root, mode: "staging", date });
		const headers = site.files.find((f) => f.fileName === "_headers")?.source as string;
		assert.match(headers, /X-Robots-Tag: noindex/);
		assert.ok(headers.includes(`script-src 'self' '${THEME_SCRIPT_HASH}'`), "CSP must allow the theme script by hash");
		const sitemap = site.files.find((f) => f.fileName === "sitemap.xml")?.source as string;
		assert.equal(all(sitemap, /<loc>/).length, pages.length - 1);
		assert.ok(site.files.some((f) => f.fileName === `files/${content.site.resumePdf.file}`));
	});

	test("production refuses to build while TODOs remain", () => {
		assert.throws(() => buildSite({ root, mode: "production", date }), /Production build blocked/);
	});

	test("production output is indexable once TODOs are done", () => {
		const site = buildSite({ root, mode: "production", date, content: launchReady() });
		const headers = site.files.find((f) => f.fileName === "_headers")?.source as string;
		assert.doesNotMatch(headers, /noindex/);
		const robots = site.files.find((f) => f.fileName === "robots.txt")?.source as string;
		assert.match(robots, /Sitemap: https:\/\/example\.com\/sitemap\.xml/);
		const home = site.pages.find((p) => p.route === "/")?.html ?? "";
		assert.doesNotMatch(home, /noindex/);
		assert.doesNotMatch(home, /class="todo"/);
	});
});
