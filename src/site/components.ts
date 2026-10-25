// The drawing-set vocabulary from DESIGN.md: pictures, dimension callouts,
// title blocks, the project register and figure plates.
import type { Content, Figure, ImageEntry, Metric, Project } from "./content.ts";
import { html, raw, text, type Raw } from "./html.ts";

const IMG_BASE = "/src/generated/img/";

const srcset = (variants: ImageEntry["webp"]): string =>
	variants.map((v) => `${IMG_BASE}${v.file} ${v.width}w`).join(", ");

export interface PictureOptions {
	alt: string;
	sizes: string;
	priority?: boolean;
	className?: string;
}

export function picture(content: Content, name: string, o: PictureOptions): Raw {
	const entry = content.images[name];
	if (!entry) throw new Error(`Image "${name}" is not in src/generated/images.json. Run \`npm run images\`.`);
	const fallback = entry.webp.find((v) => v.width >= 800) ?? entry.webp.at(-1);
	return html`<picture class="${o.className ?? ""}">
		<source type="image/avif" srcset="${srcset(entry.avif)}" sizes="${o.sizes}">
		<img src="${IMG_BASE}${fallback?.file ?? ""}" srcset="${srcset(entry.webp)}" sizes="${o.sizes}"
			width="${entry.width}" height="${entry.height}" alt="${o.alt}"
			${o.priority ? raw('fetchpriority="high" decoding="async"') : raw('loading="lazy" decoding="async"')}>
	</picture>`;
}

export const datumMark = (className = "datum"): Raw =>
	html`<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
		<circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
		<path d="M12 1.5A10.5 10.5 0 0 1 22.5 12H12zM12 22.5A10.5 10.5 0 0 1 1.5 12H12z" fill="currentColor"/>
	</svg>`;

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

/** Bill-of-materials style list of projects (h3 rows). The whole row is the link target. */
export function register(projects: Project[]): Raw {
	return html`<ol class="register" role="list">
		${projects.map((p) => {
			const featured = p.metrics.find((m) => m.featured) ?? p.metrics[0];
			return html`<li class="register__row">
				<h3 class="register__title"><a class="register__link" href="/projects/${p.slug}/">${p.register}</a></h3>
				<p class="register__summary">${p.org}</p>
				<dl class="register__meta mono">
					<div><dt>Role</dt><dd>${p.role}</dd></div>
					<div><dt>Dates</dt><dd>${p.dates}</dd></div>
				</dl>
				${featured
					? html`<p class="register__figure"><span class="register__value">${featured.value}<span class="register__unit">${featured.unit}</span></span> <span class="register__label mono">${featured.label}</span></p>`
					: ""}
			</li>`;
		})}
	</ol>`;
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
		${rows.map(([k, v]) => html`<div class="titleblock__cell"><dt class="mono">${k}</dt><dd>${v}</dd></div>`)}
	</dl>`;
}

type Span = 4 | 6;

/**
 * Lays figures out on the 12-column grid: portrait plates take 4 columns,
 * landscape plates 6. A row of two portraits widens to 6 + 6.
 */
export function figureSpans(content: Content, figures: Figure[]): Span[] {
	const natural = figures.map((f): Span => {
		const img = content.images[f.image];
		return img && img.height > img.width ? 4 : 6;
	});
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

export function figures(content: Content, p: Project): Raw {
	if (!p.figures.length) {
		return p.figuresTodo ? html`<p class="figures__todo">${text(p.figuresTodo)}</p>` : html``;
	}
	const spans = figureSpans(content, p.figures);
	return html`<div class="figures" data-viewer>
		${p.figures.map((f, i) => {
			const span = spans[i] ?? 6;
			const img = content.images[f.image];
			const orientation = img && img.height > img.width ? "portrait" : "landscape";
			const sizes =
				span === 4
					? "(min-width: 1440px) 440px, (min-width: 1000px) 30vw, (min-width: 640px) 50vw, 100vw"
					: "(min-width: 1440px) 680px, (min-width: 640px) 50vw, 100vw";
			return html`<figure class="plate plate--${f.kind} plate--${orientation} plate--span-${span}">
				<div class="plate__frame">${picture(content, f.image, { alt: f.alt, sizes })}</div>
				<figcaption class="plate__caption">${text(f.caption)}</figcaption>
			</figure>`;
		})}
	</div>`;
}
