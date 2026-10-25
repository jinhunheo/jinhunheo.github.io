import { datumMark } from "./components.ts";
import { html, type Raw } from "./html.ts";
import { headMeta, isoDate, type PageSeo, type RenderContext } from "./seo.ts";

export interface Sheet {
	/** "01", "03.2" */
	no: string;
	/** Breadcrumb-style label shown in the sheet bar. */
	label: string;
	/** Which top-level nav item is current. */
	section?: string;
}

export function layout(ctx: RenderContext, o: { seo: PageSeo; sheet: Sheet; body: Raw; bodyClass?: string }): string {
	const { site } = ctx.content;
	const rev = isoDate(ctx.date);
	return `<!doctype html>${html`<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
	<meta name="color-scheme" content="dark">
	<meta name="theme-color" content="#0b0b0b">
	<link rel="preload" href="/src/client/fonts/archivo-latin-var.woff2" as="font" type="font/woff2" crossorigin>
	<link rel="preload" href="/src/client/fonts/martian-mono-latin-var.woff2" as="font" type="font/woff2" crossorigin>
	<link rel="stylesheet" href="/src/client/styles/main.css">
	<script type="module" src="/src/client/main.ts"></script>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml">
	<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
	<link rel="apple-touch-icon" href="/apple-touch-icon.png">
	${headMeta(ctx, o.seo)}
</head>
<body class="${o.bodyClass ?? ""}">
	<a class="skip mono" href="#main">Skip to content</a>
	<div class="grid-lines" aria-hidden="true">${Array.from({ length: 12 }, () => html`<span></span>`)}</div>
	<header class="masthead wrap">
		<a class="masthead__mark" href="/">${datumMark()}<span>${site.name}</span></a>
		<p class="masthead__meta mono">${site.descriptor} · ${site.schoolShort}</p>
		<nav class="nav" aria-label="Main">
			<ol class="nav__list" role="list">
				${site.nav.map(
					(item, i) => html`<li><a class="nav__link mono" href="${item.href}" ${o.sheet.section === item.href ? html`aria-current="page"` : ""}><span class="nav__no" aria-hidden="true">0${i + 1}</span><span class="nav__label">${item.label}</span></a></li>`,
				)}
			</ol>
		</nav>
	</header>
	<main id="main" class="wrap" tabindex="-1">
		<div class="sheetbar mono">
			<span class="sheetbar__no">Sheet ${o.sheet.no}</span>
			<span class="sheetbar__label">${o.sheet.label}</span>
			<span class="sheetbar__rev">Rev. ${rev}</span>
		</div>
		${o.body}
	</main>
	<footer class="footer wrap">
		<dl class="footer__block mono">
			<div><dt>Drawn by</dt><dd>${site.name}</dd></div>
			<div><dt>Based in</dt><dd>${site.location.label}</dd></div>
			<div><dt>Email</dt><dd><a href="mailto:${site.contact.email}">${site.contact.email}</a></dd></div>
			<div><dt>Revision</dt><dd>${rev}</dd></div>
		</dl>
		<p class="footer__copy mono">© ${ctx.date.getFullYear()} ${site.name}</p>
	</footer>
</body>
</html>
`}`;
}
