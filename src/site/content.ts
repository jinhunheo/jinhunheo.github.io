// Loads and validates everything in content/. Templates receive a typed
// `Content` object and never read files themselves.
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { isTodo } from "./html.ts";

export type SiteMode = "development" | "staging" | "production";

export interface SeoCopy {
	title: string;
	description: string;
}

export interface Site {
	name: string;
	descriptor: string;
	school: string;
	schoolShort: string;
	location: { label: string; locality: string; region: string; country: string };
	urls: { production: string; staging: string };
	contact: { email: string; phone: string; phoneHref: string; linkedin: string };
	resumePdf: { file: string; label: string };
	interests: string[];
	categories: Record<string, string>;
	nav: { label: string; href: string }[];
}

interface PageCopy {
	seo: SeoCopy;
	title: string;
	intro: string;
}

export interface Pages {
	home: {
		seo: SeoCopy;
		greeting: string;
		bio: string;
		headshot: { image: string; alt: string };
		projects: { title: string; more: string };
	};
	resume: PageCopy;
	projects: PageCopy;
	notFound: { seo: SeoCopy; title: string; text: string };
}

export interface ResumeEntry {
	title: string;
	org: string;
	dates: string;
	project?: string;
	bullets: string[];
}

export interface Resume {
	education: { school: string; degree: string; dates: string; gpa: string }[];
	skills: { group: string; items: string[] }[];
	experience: ResumeEntry[];
	projects: ResumeEntry[];
}

export interface Metric {
	value: string;
	unit: string;
	label: string;
	featured?: boolean;
}

export interface Figure {
	image: string;
	kind: "photo" | "cad";
	alt: string;
	caption: string;
}

export interface Project {
	slug: string;
	title: string;
	register: string;
	category: string;
	order: number;
	org: string;
	role: string;
	dates: string;
	tools: string[];
	/** Search-result description, at most 160 characters. */
	description: string;
	summary: string;
	metrics: Metric[];
	/** Image for the home page card (from content/media). Leave out to keep an empty space. */
	cover?: string;
	figures: Figure[];
	/** Markdown body. */
	body: string;
}

export interface ImageVariant {
	width: number;
	file: string;
}

export interface ImageEntry {
	width: number;
	height: number;
	source: string;
	avif: ImageVariant[];
	webp: ImageVariant[];
}

export interface Content {
	root: string;
	site: Site;
	pages: Pages;
	resume: Resume;
	projects: Project[];
	images: Record<string, ImageEntry>;
	/** Sizes in bytes of the downloadable files in content/files/. */
	fileSizes: Record<string, number>;
}

export interface Todo {
	where: string;
	text: string;
}

const readYaml = <T>(file: string): T => parseYaml(fs.readFileSync(file, "utf8")) as T;

function parseFrontmatter(file: string): { data: Record<string, unknown>; body: string } {
	const source = fs.readFileSync(file, "utf8").replaceAll("\r\n", "\n");
	const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(source);
	if (!match) throw new Error(`${file}: missing YAML frontmatter`);
	return { data: parseYaml(match[1] ?? "") as Record<string, unknown>, body: (match[2] ?? "").trim() };
}

function requireStrings(where: string, data: Record<string, unknown>, keys: string[]): void {
	for (const key of keys) {
		if (typeof data[key] !== "string" || !(data[key] as string).trim()) {
			throw new Error(`${where}: "${key}" must be a non-empty string`);
		}
	}
}

export function loadContent(root: string): Content {
	const dir = path.join(root, "content");
	const site = readYaml<Site>(path.join(dir, "site.yaml"));
	const pages = readYaml<Pages>(path.join(dir, "pages.yaml"));
	const resume = readYaml<Resume>(path.join(dir, "resume.yaml"));

	const manifestFile = path.join(root, "src", "generated", "images.json");
	const images: Record<string, ImageEntry> = fs.existsSync(manifestFile)
		? (JSON.parse(fs.readFileSync(manifestFile, "utf8")) as Record<string, ImageEntry>)
		: {};

	const projectDir = path.join(dir, "projects");
	const projects = fs
		.readdirSync(projectDir)
		.filter((f) => f.endsWith(".md"))
		.map((f): Project => {
			const where = `content/projects/${f}`;
			const { data, body } = parseFrontmatter(path.join(projectDir, f));
			requireStrings(where, data, ["title", "register", "category", "org", "role", "dates", "description", "summary"]);
			if (String(data.description).length > 160) throw new Error(`${where}: description is over 160 characters`);
			if (!(String(data.category) in site.categories)) {
				throw new Error(`${where}: category "${String(data.category)}" is not listed in site.yaml categories`);
			}
			const figures = (data.figures ?? []) as Figure[];
			for (const [i, fig] of figures.entries()) {
				requireStrings(`${where} figure ${i + 1}`, fig as unknown as Record<string, unknown>, ["image", "alt", "caption"]);
				if (fig.kind !== "photo" && fig.kind !== "cad") throw new Error(`${where} figure ${i + 1}: kind must be photo or cad`);
			}
			return {
				...(data as unknown as Omit<Project, "slug" | "body" | "figures" | "metrics" | "tools">),
				slug: f.replace(/\.md$/, ""),
				order: Number(data.order ?? 99),
				tools: (data.tools ?? []) as string[],
				metrics: (data.metrics ?? []) as Metric[],
				figures,
				body,
			};
		})
		.sort((a, b) => a.order - b.order);

	for (const entry of [...resume.experience, ...resume.projects]) {
		if (entry.project && !projects.some((p) => p.slug === entry.project)) {
			throw new Error(`content/resume.yaml: "${entry.title}" links to unknown project "${entry.project}"`);
		}
	}

	const filesDir = path.join(dir, "files");
	const fileSizes = Object.fromEntries(
		fs.readdirSync(filesDir).map((name) => [name, fs.statSync(path.join(filesDir, name)).size]),
	);
	if (!(site.resumePdf.file in fileSizes)) {
		throw new Error(`site.yaml resumePdf.file "${site.resumePdf.file}" is not in content/files/`);
	}

	return { root, site, pages, resume, projects, images, fileSizes };
}

/** Every "TODO: …" string anywhere in the content, with where it lives. */
export function findTodos(content: Content): Todo[] {
	const todos: Todo[] = [];
	const walk = (value: unknown, where: string): void => {
		if (typeof value === "string") {
			if (isTodo(value)) todos.push({ where, text: value.trim() });
			for (const line of value.split("\n").filter((l) => /TODO:/.test(l) && !isTodo(value))) {
				todos.push({ where, text: line.trim() });
			}
		} else if (Array.isArray(value)) {
			value.forEach((v, i) => walk(v, `${where}[${i}]`));
		} else if (value && typeof value === "object") {
			for (const [k, v] of Object.entries(value)) walk(v, where ? `${where}.${k}` : k);
		}
	};
	walk(content.site, "site.yaml");
	walk(content.pages, "pages.yaml");
	walk(content.resume, "resume.yaml");
	for (const p of content.projects) walk(p, `projects/${p.slug}.md`);
	return todos;
}

export function siteUrl(content: Content, mode: SiteMode): string {
	if (mode === "development") return "http://localhost:5173";
	const url = mode === "production" ? content.site.urls.production : content.site.urls.staging;
	if (isTodo(url)) throw new Error(`site.yaml urls.${mode} is still a TODO`);
	return url.replace(/\/$/, "");
}
