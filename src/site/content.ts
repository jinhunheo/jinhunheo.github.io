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

export interface Pages {
	home: {
		seo: SeoCopy;
		greeting: string;
		bio: string;
		headshot: { image: string; alt: string };
		projects: { title: string; more: string };
	};
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
	/** Still image; for a video this is its poster frame. */
	image: string;
	kind: "photo" | "cad" | "video";
	/** For kind: video, the name of the .mp4 in content/media (from npm run import-video). */
	video?: string;
	alt: string;
	/** Required, except on the slides of a group that has its own caption. */
	caption?: string;
}

/**
 * One spot in a project gallery: a single figure, or several slides (photos and
 * CAD, not videos) swiped through with arrows, optionally sharing one caption.
 */
export interface GalleryItem {
	slides: Figure[];
	caption?: string;
}

export interface ProjectDocument {
	/** File in content/files, served at /files/<file>. */
	file: string;
	label: string;
	description: string;
}

/** An outside link, such as the project's code repository. */
export interface ProjectLink {
	url: string;
	label: string;
	description: string;
}

export interface Project {
	slug: string;
	/** Used everywhere the project is named: home card, project page, pager, search results. */
	title: string;
	category: string;
	order: number;
	org: string;
	role: string;
	dates: string;
	skills: string[];
	/** Search-result description, at most 160 characters. */
	description: string;
	summary: string;
	metrics: Metric[];
	/** Image for the home page card (from content/media). Leave out to keep an empty space. */
	cover?: string;
	/** From the `figures` list in the frontmatter. */
	gallery: GalleryItem[];
	documents: ProjectDocument[];
	links: ProjectLink[];
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
			requireStrings(where, data, ["title", "category", "org", "role", "dates", "description", "summary"]);
			if (String(data.description).length > 160) throw new Error(`${where}: description is over 160 characters`);
			if (!(String(data.category) in site.categories)) {
				throw new Error(`${where}: category "${String(data.category)}" is not listed in site.yaml categories`);
			}
			const entries = (data.figures ?? []) as (Figure | GalleryItem)[];
			const gallery = entries.map((entry, i): GalleryItem => {
				const at = `${where} figure ${i + 1}`;
				const group = "slides" in entry ? entry : undefined;
				if (group && (!Array.isArray(group.slides) || group.slides.length < 2)) throw new Error(`${at}: "slides" needs at least two images`);
				const slides = group ? group.slides : [entry as Figure];
				slides.forEach((fig, j) => {
					const here = group ? `${at} slide ${j + 1}` : at;
					requireStrings(here, fig as unknown as Record<string, unknown>, group?.caption ? ["image", "alt"] : ["image", "alt", "caption"]);
					if (!["photo", "cad", "video"].includes(fig.kind)) throw new Error(`${here}: kind must be photo, cad or video`);
					if (fig.kind === "video" && group) throw new Error(`${here}: videos can't be slides in a group`);
					if (fig.kind === "video" && !fs.existsSync(path.join(dir, "media", `${fig.video ?? ""}.mp4`))) {
						throw new Error(`${here}: video "${fig.video ?? ""}" is not in content/media (run npm run import-video)`);
					}
				});
				return group?.caption ? { slides, caption: group.caption } : { slides };
			});
			return {
				...(data as unknown as Omit<Project, "slug" | "body" | "gallery" | "metrics" | "skills">),
				slug: f.replace(/\.md$/, ""),
				order: Number(data.order ?? 99),
				skills: (data.skills ?? []) as string[],
				metrics: (data.metrics ?? []) as Metric[],
				gallery,
				documents: (data.documents ?? []) as ProjectDocument[],
				links: (data.links ?? []) as ProjectLink[],
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
	for (const p of projects) {
		for (const d of p.documents) {
			if (!(d.file in fileSizes)) throw new Error(`content/projects/${p.slug}.md: document "${d.file}" is not in content/files/`);
		}
		for (const l of p.links) {
			if (!/^https:\/\/[^\s"]+$/.test(l.url)) throw new Error(`content/projects/${p.slug}.md: link "${l.url}" must be a full https:// address`);
		}
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
