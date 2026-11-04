// Shared building blocks (see DESIGN.md): pictures, the logo, dimension
// callouts, title blocks, project cards and the gallery.
import type { Content, Figure, GalleryItem, ImageEntry, Metric, Project, ProjectDocument } from "./content.ts";
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

/**
 * Jinhun's "JH" logo, traced from the original artwork (a 1254 px grid) so it stays
 * sharp and takes the text color in both themes. Same drawing as public/favicon.svg.
 */
export const logoMark = (): Raw =>
	html`<svg class="logo" viewBox="273 356 650 559" aria-hidden="true" focusable="false">
		<path d="M441 356.5H719.9L638 442H533.5V695A55 55 0 0 1 478.5 750H441Z"/>
		<path d="M666.5 439.8V578.5H819.5V358.5H922.5V905.5H819.5V667.5H666.5V716.5A196.5 196.5 0 0 1 273.5 716.5V715.5H374.5V721A99.5 99.5 0 0 0 573.5 721V528.6Z"/>
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
		["Organization", p.org],
		["Title", p.role],
		["Duration", p.dates],
		["Skills", p.skills.join(" · ")],
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

/** A group's frame follows its first slide, so the gallery keeps its layout. */
const leadSlide = (item: GalleryItem): Figure => {
	const first = item.slides[0];
	if (!first) throw new Error("Gallery item without images");
	return first;
};

/**
 * Lays gallery spots out on the 12-column grid: portrait plates take 4 columns,
 * landscape plates 6. A row of two portraits widens to 6 + 6.
 */
export function figureSpans(content: Content, items: GalleryItem[]): Span[] {
	const natural = items.map((item): Span => (isPortrait(content, leadSlide(item)) ? 4 : 6));
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
 * the title, summary and "Learn more". Reports are linked only from the project
 * page's Report section, so every card looks the same.
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
			<h3 class="card__title">${p.title}</h3>
			<p class="card__text">${p.summary}</p>
			<div class="card__actions">
				<a class="btn btn--primary" href="${href}">${more}<span class="visually-hidden"> about ${p.title}</span></a>
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

type Orientation = "portrait" | "landscape";

interface PlateOptions {
	orientation: Orientation;
	sizes: string;
	caption?: string | undefined;
	span?: Span;
}

function plate(content: Content, f: Figure, o: PlateOptions): Raw {
	const span = o.span ? ` plate--span-${o.span}` : "";
	return html`<figure class="plate plate--${f.kind} plate--${o.orientation}${span}">
		<div class="plate__frame">${f.kind === "video" ? video(content, f) : picture(content, f.image, { alt: f.alt, sizes: o.sizes })}</div>
		${o.caption ? html`<figcaption class="plate__caption">${text(o.caption)}</figcaption>` : ""}
	</figure>`;
}

const chevron = (d: string): Raw =>
	html`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/**
 * Several images in one gallery spot, like a swipeable social media post: a
 * scroll-snap strip that works by touch, trackpad and keyboard on its own. The
 * script adds the arrows and dots (hidden until then). Each slide carries its own
 * caption, so the caption moves with its image; a shared caption sits underneath.
 */
function carousel(content: Content, item: GalleryItem, o: PlateOptions & { span: Span }): Raw {
	const n = item.slides.length;
	return html`<div class="carousel carousel--${o.orientation} plate--span-${o.span}" data-carousel role="group" aria-roledescription="carousel" aria-label="${n} images">
		<div class="carousel__track" tabindex="0">
			${item.slides.map(
				(f, i) => html`<div class="carousel__slide" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${n}">
					${plate(content, f, { orientation: o.orientation, sizes: o.sizes, caption: f.caption })}
				</div>`,
			)}
		</div>
		<div class="carousel__nav" hidden>
			<button type="button" class="carousel__btn carousel__btn--prev" aria-label="Previous image">${chevron("M14.5 6l-6 6 6 6")}</button>
			<button type="button" class="carousel__btn carousel__btn--next" aria-label="Next image">${chevron("M9.5 6l6 6-6 6")}</button>
			<span class="carousel__dots" aria-hidden="true">${item.slides.map(() => html`<span class="carousel__dot"></span>`)}</span>
		</div>
		${item.caption ? html`<p class="plate__caption carousel__caption">${text(item.caption)}</p>` : ""}
	</div>`;
}

export function figures(content: Content, p: Project): Raw {
	const spans = figureSpans(content, p.gallery);
	return html`<div class="figures" data-viewer>
		${p.gallery.map((item, i) => {
			const span = spans[i] ?? 6;
			const first = leadSlide(item);
			const orientation: Orientation = isPortrait(content, first) ? "portrait" : "landscape";
			const sizes =
				span === 4
					? "(min-width: 1440px) 440px, (min-width: 1000px) 30vw, (min-width: 640px) 50vw, 100vw"
					: "(min-width: 1440px) 680px, (min-width: 640px) 50vw, 100vw";
			return item.slides.length > 1
				? carousel(content, item, { orientation, sizes, span })
				: plate(content, first, { orientation, sizes, span, caption: first.caption ?? item.caption });
		})}
	</div>`;
}
