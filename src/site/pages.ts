import { dimension, documentLink, externalLink, figures, metricList, picture, projectCard, sectionHead, titleBlock } from "./components.ts";
import type { Project } from "./content.ts";
import { html } from "./html.ts";
import { layout } from "./layout.ts";
import { markdownSections } from "./markdown.ts";
import { breadcrumbs, person, profilePage, type RenderContext } from "./seo.ts";

export interface PageOut {
	route: string;
	/** Output path relative to the site root, e.g. "projects/x/index.html". */
	file: string;
	/** Social preview id and the text drawn on it. */
	og: { id: string; label: string; title: string; metric?: { value: string; unit: string; label: string } };
	html: string;
}

/** Projects live on the home page; this is where every "back to projects" link goes. */
const PROJECTS = "/#projects";

const fileFor = (route: string): string => (route === "/" ? "index.html" : `${route.replace(/^\/|\/$/g, "")}/index.html`);

export function home(ctx: RenderContext): PageOut {
	const { site, pages, projects } = ctx.content;
	const copy = pages.home;
	const body = html`
	<section class="hero" aria-labelledby="greeting">
		<div class="hero__portrait">
			${picture(ctx.content, copy.headshot.image, { alt: copy.headshot.alt, sizes: "(min-width: 960px) 400px, 44vw", priority: true, className: "portrait" })}
		</div>
		<div class="hero__text">
			<h1 class="hero__greeting display" id="greeting">${copy.greeting}</h1>
			<p class="hero__bio">${copy.bio}</p>
		</div>
	</section>

	<section class="work" id="projects" aria-labelledby="work-title">
		<h2 class="work__title" id="work-title">${copy.projects.title}</h2>
		<ol class="cards" role="list">
			${projects.map((p) => projectCard(ctx.content, p, copy.projects.more))}
		</ol>
	</section>`;

	return {
		route: "/",
		file: fileFor("/"),
		og: { id: "home", label: "Home", title: site.name },
		html: layout(ctx, {
			seo: { route: "/", title: copy.seo.title, description: copy.seo.description, og: "home", type: "profile", jsonLd: [profilePage(ctx)] },
			body,
			bodyClass: "page-home",
		}),
	};
}

export function projectPage(ctx: RenderContext, project: Project): PageOut {
	const { site, projects } = ctx.content;
	const index = projects.indexOf(project);
	const route = `/projects/${project.slug}/`;
	const prev = projects[index - 1];
	const next = projects[index + 1];
	const featured = project.metrics.find((m) => m.featured) ?? project.metrics[0];
	const sections = markdownSections(project.body);

	const body = html`
	<article class="project">
		<header class="project__head">
			<p class="crumb label"><a href="${PROJECTS}">Projects</a> <span aria-hidden="true">/</span> ${site.categories[project.category]}</p>
			<h1 class="project__title display">${project.title}</h1>
			<p class="lede">${project.summary}</p>
			${titleBlock(ctx.content, project)}
		</header>
		${project.metrics.length
			? html`<section class="band band--tight" aria-labelledby="results">
					<h2 class="visually-hidden" id="results">Results</h2>
					${metricList(project.metrics, project.metrics.length > 2 ? "dims--quad" : "")}
				</section>`
			: ""}
		${sections.map(
			(s) => html`<section class="band" ${s.heading ? html`aria-labelledby="${s.id}"` : ""}>
				${s.heading ? sectionHead(s.id, s.heading) : ""}
				<div class="band__body prose">${s.body}</div>
			</section>`,
		)}
		${project.documents.length
			? html`<section class="band" aria-labelledby="report">
					${sectionHead("report", project.documents.length > 1 ? "Reports" : "Report")}
					<div class="band__body">
						${project.documents.map(
							(d) => html`<div class="doc">
								<p class="doc__text">${d.description}</p>
								${documentLink(ctx.content, d, "btn")}
							</div>`,
						)}
					</div>
				</section>`
			: ""}
		${project.links.length
			? html`<section class="band" aria-labelledby="code">
					${sectionHead("code", "Code")}
					<div class="band__body">
						${project.links.map(
							(l) => html`<div class="doc">
								<p class="doc__text">${l.description}</p>
								${externalLink(l, "btn")}
							</div>`,
						)}
					</div>
				</section>`
			: ""}
		${project.gallery.length
			? html`<section class="band band--figures" aria-labelledby="gallery">
					${sectionHead("gallery", "Gallery")}
					${figures(ctx.content, project)}
				</section>`
			: ""}
		<nav class="pager" aria-label="More projects">
			${prev ? html`<a class="pager__link pager__link--prev" href="/projects/${prev.slug}/"><span class="label">Previous project</span><span>${prev.title}</span></a>` : html`<span></span>`}
			${next ? html`<a class="pager__link pager__link--next" href="/projects/${next.slug}/"><span class="label">Next project</span><span>${next.title}</span></a>` : html`<a class="pager__link pager__link--next" href="${PROJECTS}"><span class="label">Back to</span><span>All projects</span></a>`}
		</nav>
	</article>`;

	return {
		route,
		file: fileFor(route),
		og: { id: `project-${project.slug}`, label: "Projects", title: project.title, metric: featured },
		html: layout(ctx, {
			seo: {
				route,
				title: `${project.title} · ${site.name}`,
				description: project.description,
				og: `project-${project.slug}`,
				type: "article",
				jsonLd: [
					{
						"@context": "https://schema.org",
						"@type": "CreativeWork",
						name: project.title,
						description: project.summary,
						url: ctx.url + route,
						image: `${ctx.url}/og/project-${project.slug}.jpg`,
						creator: person(ctx),
						keywords: project.skills.join(", "),
					},
					breadcrumbs(ctx, [
						{ name: "Home", route: "/" },
						{ name: "Projects", route: PROJECTS },
						{ name: project.title, route },
					]),
				],
			},
			body,
		}),
	};
}

export function notFoundPage(ctx: RenderContext): PageOut {
	const copy = ctx.content.pages.notFound;
	const body = html`
	<header class="page-head page-head--404">
		<p class="notfound__dim" aria-hidden="true">${dimension({ value: "404", unit: "", label: "" })}</p>
		<h1 class="page-head__title display">${copy.title}</h1>
		<p class="page-head__intro">${copy.text}</p>
		<div class="actions">
			<a class="btn btn--primary" href="/">Go to the home page</a>
			<a class="btn" href="${PROJECTS}">See projects</a>
		</div>
	</header>`;
	return {
		route: "/404",
		file: "404.html",
		og: { id: "home", label: "Home", title: ctx.content.site.name },
		html: layout(ctx, {
			seo: { route: "/404", title: copy.seo.title, description: copy.seo.description, og: "home" },
			body,
		}),
	};
}
