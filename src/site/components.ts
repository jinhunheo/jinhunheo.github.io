// Shared building blocks (see DESIGN.md): pictures, the logo, dimension
// callouts, title blocks, project cards and the gallery.
import type { Content, Figure, ImageEntry, Metric, Project, ProjectDocument } from "./content.ts";
import { html, raw, text, type Raw } from "./html.ts";

const IMG_BASE = "/src/generated/img/";

const srcset = (variants: ImageEntry["webp"]): string =>
	variants.map((v) => `${IMG_BASE}${v.file} ${v.width}w`).join(", ");

const imageEntry = (content: Content, name: string): ImageEntry => {
	const entry = content.images[name];
	if (!entry) throw new Error(`Image "${name}" is not in src/generated/images.json. Run "npm run images".`);
	return entry;
};

export interface PictureOptions {
	alt: string;
	sizes: string;
	priority?: boolean;
	className?: string;
}

export function picture(content: Content, name: string, o: PictureOptions): Raw {
	const entry = imageEntry(content, name);
	const fallback = entry.webp.find((v) => v.width >= 800) ?? entry.webp.at(-1);
	return html`<picture class="${o.className ?? ""}">
		<source type="image/avif" srcset="${srcset(entry.avif)}" sizes="${o.sizes}">
		<img src="${IMG_BASE}${fallback?.file ?? ""}" srcset="${srcset(entry.webp)}" sizes="${o.sizes}"
			width="${entry.width}" height="${entry.height}" alt="${o.alt}"
			${o.priority ? raw('fetchpriority="high" decoding="async"') : raw('loading="lazy" decoding="async"')}>
	</picture>`;
}

/** "JH" monogram: initials knocked out of a rounded square. Same drawing as public/favicon.svg. */
export const logoMark = (): Raw =>
	html`<svg class="logo" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
		<rect class="logo__tile" width="32" height="32" rx="9"/>
		<g class="logo__letters" fill="none" stroke-width="2.6" stroke-linecap="square">
			<path d="M14 9V18.2a4 4 0 0 1-8 0v-.7"/><path d="M18.5 9v14M26.5 9v14M18.5 16h8"/>
		</g>
	</svg>`;

/** Link that opens a document (PDF) from content/files in the browser's own reader. */
export function documentLink(content: Content, d: ProjectDocument, className: string): Raw {
	const mb = ((content.fileSizes[d.file] ?? 0) / 1024 / 1024).toFixed(1);
	return html`<a class="${className}" href="/files/${d.file}" target="_blank" rel="noopener">${d.label}<span class="btn__meta">PDF · ${mb} MB</span></a>`;
}

/** A measured value drawn as a dimension line with arrowheads and extension lines. */
export function dimension(metric: Metric): Raw {
	return html`<span class="dim">
		<span class="dim__line dim__line--start" aria-hidden="true"></span>
		<span class="dim__value">${metric.value}<span class="dim__unit">${metric.unit}</span></span>
		<span class="dim__line dim__line--end" aria-hidden="true"></span>
	</span>`;
}

export function metricList(metrics: Metric[], className = ""): Raw {
	return html`<ul class="dims ${className}" role="list">
		${metrics.map(
			(metric) => html`<li class="dims__item">
				${dimension(metric)}
				<span class="dims__label">${metric.label}</span>
			</li>`,
		)}
	</ul>`;
}

export function sectionHead(id: string, title: string, intro?: string): Raw {
	return html`<header class="section-head">
		<h2 class="section-head__title" id="${id}">${title}</h2>
		${intro ? html`<p class="section-head__intro">${text(intro)}</p>` : ""}
	</header>`;
}

/** The project's title block: the corner table of a drawing, as a grid. */
export function titleBlock(content: Content, p: Project): Raw {
	const rows: [string, string][] = [
		["Type", content.site.categories[p.category] ?? p.category],
		["Organisation", p.org],
		["Role", p.role],
		["Dates", p.dates],
		["Tools", p.tools.join(" · ")],
	];
	return html`<dl class="titleblock">
		${rows.map(([k, v]) => html`<div class="titleblock__cell"><dt class="label">${k}</dt><dd>${v}</dd></div>`)}
	</dl>`;
}

type Span = 4 | 6;

const isPortrait = (content: Content, f: Figure): boolean => {
	const img = content.images[f.image];
	return !!img && img.height > img.width;
};

/**
 * Lays figures out on the 12-column grid: portrait plates take 4 columns,
 * landscape plates 6. A row of two portraits widens to 6 + 6.
 */
export function figureSpans(content: Content, figures: Figure[]): Span[] {
	const natural = figures.map((f): Span => (isPortrait(content, f) ? 4 : 6));
	const spans = [...natural];
	let rowStart = 0;
	let used = 0;
	const closeRow = (end: number): void => {
		const row = spans.slice(rowStart, end);
		if (row.length === 2 && row.every((s) => s === 4)) spans.fill(6, rowStart, end);
		rowStart = end;
		used = 0;
	};
	natural.forEach((span, i) => {
		if (used + span > 12) closeRow(i);
		used += span;
		if (used === 12) closeRow(i + 1);
	});
	closeRow(spans.length);
	return spans;
}

/**
 * Home page project row: image (or an empty space until one is added) beside
 * the title, summary, "Learn more" and any documents.
 */
export function projectCard(content: Content, p: Project, more: string): Raw {
	const href = `/projects/${p.slug}/`;
	const media = p.cover
		? picture(content, p.cover, { alt: "", sizes: "(min-width: 960px) 560px, 100vw", className: "card__picture" })
		: html`<span class="card__placeholder"></span>`;
	return html`<li class="card">
		<a class="card__media" href="${href}" tabindex="-1" aria-hidden="true">${media}</a>
		<div class="card__body">
			<p class="card__meta">${content.site.categories[p.category]} · ${p.dates}</p>
			<h3 class="card__title">${p.register}</h3>
			<p class="card__text">${p.summary}</p>
			<div class="card__actions">
				<a class="btn btn--primary" href="${href}">${more}<span class="visually-hidden"> about ${p.register}</span></a>
				${p.documents.map((d) => documentLink(content, d, "btn"))}
			</div>
		</div>
	</li>`;
}

/**
 * A silent project video. Nothing loads until it is played (no autoplay); the
 * poster frame comes from the image pipeline.
 */
function video(content: Content, f: Figure): Raw {
	const poster = imageEntry(content, f.image);
	const frame = poster.webp.find((v) => v.width >= 800) ?? poster.webp.at(-1);
	const captions = `${f.video ?? ""}.vtt`;
	return html`<video class="plate__video" controls muted playsinline preload="none"
		poster="${IMG_BASE}${frame?.file ?? ""}" width="${poster.width}" height="${poster.height}" aria-label="${f.alt}">
		<source src="/content/media/${f.video ?? ""}.mp4" type="video/mp4">
		${captions in content.fileSizes ? html`<track kind="captions" src="/files/${captions}" srclang="en" label="English">` : ""}
	</video>`;
}

export function figures(content: Content, p: Project): Raw {
	const spans = figureSpans(content, p.figures);
	return html`<div class="figures" data-viewer>
		${p.figures.map((f, i) => {
			const span = spans[i] ?? 6;
			const orientation = isPortrait(content, f) ? "portrait" : "landscape";
			const sizes =
				span === 4
					? "(min-width: 1440px) 440px, (min-width: 1000px) 30vw, (min-width: 640px) 50vw, 100vw"
					: "(min-width: 1440px) 680px, (min-width: 640px) 50vw, 100vw";
			return html`<figure class="plate plate--${f.kind} plate--${orientation} plate--span-${span}">
				<div class="plate__frame">${f.kind === "video" ? video(content, f) : picture(content, f.image, { alt: f.alt, sizes })}</div>
				<figcaption class="plate__caption">${text(f.caption)}</figcaption>
			</figure>`;
		})}
	</div>`;
}
