import { datumMark } from "./components.ts";
import { html, type Raw } from "./html.ts";
import { headMeta, type PageSeo, type RenderContext } from "./seo.ts";

/**
 * @param o.section which top-level nav item is current ("/", "/resume/", …)
 */
export function layout(ctx: RenderContext, o: { seo: PageSeo; section?: string; body: Raw; bodyClass?: string }): string {
	const { site } = ctx.content;
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
			<ul class="nav__list" role="list">
				${site.nav.map(
					(item) => html`<li><a class="nav__link mono" href="${item.href}" ${o.section === item.href ? html`aria-current="page"` : ""}>${item.label}</a></li>`,
				)}
			</ul>
		</nav>
	</header>
	<main id="main" class="wrap" tabindex="-1">
		${o.body}
	</main>
	<footer class="footer wrap">
		<dl class="footer__block mono">
			<div><dt>Name</dt><dd>${site.name}</dd></div>
			<div><dt>Based in</dt><dd>${site.location.label}</dd></div>
			<div><dt>Email</dt><dd><a href="mailto:${site.contact.email}">${site.contact.email}</a></dd></div>
		</dl>
		<p class="footer__copy mono">© ${ctx.date.getFullYear()} ${site.name}</p>
	</footer>
</body>
</html>
`}`;
}
