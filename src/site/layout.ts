import { logoMark } from "./components.ts";
import { html, raw, type Raw } from "./html.ts";
import { cspMeta, headMeta, type PageSeo, type RenderContext } from "./seo.ts";
import { THEME_SCRIPT } from "./theme.ts";

const themeToggle = html`<button class="theme-toggle icon-btn" type="button" aria-pressed="false" hidden>
	<span class="visually-hidden">Dark mode</span>
	<svg class="theme-toggle__moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.4 14.6A8.5 8.5 0 0 1 9.4 3.6a8.5 8.5 0 1 0 11 11z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
	<svg class="theme-toggle__sun" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
</button>`;

const linkedinIcon = raw(
	'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>',
);
const mailIcon = raw(
	'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="2.75" y="4.75" width="18.5" height="14.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
);

export function layout(ctx: RenderContext, o: { seo: PageSeo; body: Raw; bodyClass?: string }): string {
	const { site } = ctx.content;
	return `<!doctype html>${html`<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
	${cspMeta(ctx)}
	<script>${raw(THEME_SCRIPT)}</script>
	<meta name="color-scheme" content="light dark">
	<meta name="theme-color" content="#ffffff">
	<link rel="preload" href="/src/client/fonts/archivo-latin-var.woff2" as="font" type="font/woff2" crossorigin>
	<link rel="stylesheet" href="/src/client/styles/main.css">
	<script type="module" src="/src/client/main.ts"></script>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml">
	<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
	<link rel="apple-touch-icon" href="/apple-touch-icon.png">
	${headMeta(ctx, o.seo)}
</head>
<body class="${o.bodyClass ?? ""}">
	<a class="skip" href="#main">Skip to content</a>
	<header class="masthead wrap">
		<a class="masthead__mark" href="/" aria-label="${site.name}, home">${logoMark()}<span class="masthead__name" aria-hidden="true">${site.name}</span></a>
		<nav class="nav" aria-label="Main">
			<ul class="nav__list" role="list">
				${site.nav.map((item) => html`<li><a class="nav__link" href="${item.href}">${item.label}</a></li>`)}
			</ul>
		</nav>
		<div class="masthead__actions">
			<a class="icon-btn" href="${site.contact.linkedin}" target="_blank" rel="noopener me" aria-label="${site.name} on LinkedIn">${linkedinIcon}</a>
			<a class="icon-btn" href="mailto:${site.contact.email}" data-copy-email="${site.contact.email}" aria-label="Email ${site.name} (${site.contact.email})">${mailIcon}</a>
			${themeToggle}
		</div>
	</header>
	<main id="main" class="wrap" tabindex="-1">
		${o.body}
	</main>
	<footer class="footer wrap">
		<p class="footer__copy">© ${site.name} ${ctx.date.getFullYear()}</p>
	</footer>
	<p class="toast" role="status" aria-live="polite"></p>
</body>
</html>
`}`;
}
