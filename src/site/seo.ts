import type { Content, SiteMode } from "./content.ts";
import { html, raw, type Raw } from "./html.ts";
import { THEME_SCRIPT_HASH } from "./theme.ts";

export interface RenderContext {
	content: Content;
	mode: SiteMode;
	/** Absolute origin for canonical links, e.g. https://example.com */
	url: string;
	date: Date;
}

export interface PageSeo {
	route: string;
	title: string;
	description: string;
	/** Social preview image id: public/og/<id>.jpg */
	og: string;
	type?: "website" | "profile" | "article";
	jsonLd?: object[];
}

export const isoDate = (d: Date): string => d.toISOString().slice(0, 10);

export function headMeta(ctx: RenderContext, seo: PageSeo): Raw {
	const canonical = ctx.url + seo.route;
	const image = `${ctx.url}/og/${seo.og}.jpg`;
	const ld = (seo.jsonLd ?? []).map(
		(data) => html`<script type="application/ld+json">${raw(JSON.stringify(data).replaceAll("<", "\\u003c"))}</script>`,
	);
	const notFound = seo.route === "/404";
	return html`<title>${seo.title}</title>
	<meta name="description" content="${seo.description}">
	${notFound ? "" : html`<link rel="canonical" href="${canonical}">`}
	${ctx.mode === "production" && !notFound ? "" : raw('<meta name="robots" content="noindex">')}
	<meta property="og:type" content="${seo.type ?? "website"}">
	<meta property="og:site_name" content="${ctx.content.site.name}">
	<meta property="og:title" content="${seo.title}">
	<meta property="og:description" content="${seo.description}">
	<meta property="og:url" content="${canonical}">
	<meta property="og:image" content="${image}">
	<meta property="og:image:width" content="1200">
	<meta property="og:image:height" content="630">
	<meta property="og:image:alt" content="${seo.title}">
	<meta property="og:locale" content="en_US">
	<meta name="twitter:card" content="summary_large_image">
	${ld}`;
}

export function person(ctx: RenderContext): object {
	const { site, resume } = ctx.content;
	return {
		"@type": "Person",
		"@id": `${ctx.url}/#person`,
		name: site.name,
		url: `${ctx.url}/`,
		image: `${ctx.url}/og/home.jpg`,
		jobTitle: "Mechanical Engineering Student",
		email: `mailto:${site.contact.email}`,
		telephone: site.contact.phoneHref,
		address: {
			"@type": "PostalAddress",
			addressLocality: site.location.locality,
			addressRegion: site.location.region,
			addressCountry: site.location.country,
		},
		affiliation: { "@type": "CollegeOrUniversity", name: site.school },
		sameAs: [site.contact.linkedin],
		knowsAbout: [...site.interests, ...resume.skills.flatMap((s) => s.items)],
	};
}

export function profilePage(ctx: RenderContext): object {
	return {
		"@context": "https://schema.org",
		"@type": "ProfilePage",
		url: `${ctx.url}/`,
		dateModified: isoDate(ctx.date),
		mainEntity: person(ctx),
	};
}

export function breadcrumbs(ctx: RenderContext, items: { name: string; route: string }[]): object {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, i) => ({
			"@type": "ListItem",
			position: i + 1,
			name: item.name,
			item: ctx.url + item.route,
		})),
	};
}

export function sitemap(ctx: RenderContext, routes: string[]): string {
	const lastmod = isoDate(ctx.date);
	const urls = routes.map((r) => `  <url><loc>${ctx.url}${r}</loc><lastmod>${lastmod}</lastmod></url>`);
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

export function robots(ctx: RenderContext): string {
	if (ctx.mode !== "production") {
		// Crawlers must be allowed to fetch pages to see the noindex header.
		return "# Staging: every response carries X-Robots-Tag: noindex.\nUser-agent: *\nAllow: /\n";
	}
	return `User-agent: *\nAllow: /\n\nSitemap: ${ctx.url}/sitemap.xml\n`;
}

/** Workers static-assets `_headers` file. */
export function headers(ctx: RenderContext): string {
	const csp = [
		"default-src 'self'",
		"img-src 'self' data:",
		"font-src 'self'",
		"style-src 'self'",
		`script-src 'self' '${THEME_SCRIPT_HASH}'`,
		"connect-src 'self'",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'none'",
		"frame-ancestors 'none'",
		"upgrade-insecure-requests",
	].join("; ");
	const all = [
		"/*",
		`  Content-Security-Policy: ${csp}`,
		"  X-Content-Type-Options: nosniff",
		"  Referrer-Policy: strict-origin-when-cross-origin",
		"  Permissions-Policy: camera=(), microphone=(), geolocation=()",
		"  Cross-Origin-Opener-Policy: same-origin",
		"  X-Frame-Options: DENY",
	];
	if (ctx.mode !== "production") {
		all.push("  # Staging is public but must stay out of search results.", "  X-Robots-Tag: noindex");
	}
	return [
		...all,
		"",
		"/assets/*",
		"  Cache-Control: public, max-age=31536000, immutable",
		"",
		"/og/*",
		"  Cache-Control: public, max-age=86400",
		"",
	].join("\n");
}
