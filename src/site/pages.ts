import { dimension, figures, metricList, picture, projectCard, register, sectionHead, titleBlock } from "./components.ts";
import type { Project, ResumeEntry } from "./content.ts";
import { html, type Raw } from "./html.ts";
import { layout } from "./layout.ts";
import { markdownSections } from "./markdown.ts";
import { breadcrumbs, person, profilePage, type RenderContext } from "./seo.ts";

export interface PageOut {
	route: string;
	/** Output path relative to the site root, e.g. "resume/index.html". */
	file: string;
	/** Social preview id and the text drawn on it. */
	og: { id: string; label: string; title: string; metric?: { value: string; unit: string; label: string } };
	html: string;
}

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

	<section class="work" aria-labelledby="work-title">
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
			section: "/",
			body,
			bodyClass: "page-home",
		}),
	};
}

function resumeEntry(entry: ResumeEntry, projects: Project[]): Raw {
	const project = projects.find((p) => p.slug === entry.project);
	return html`<article class="cv-entry">
		<header class="cv-entry__head">
			<h3 class="cv-entry__title">${entry.title}</h3>
			<p class="cv-entry__org">${entry.org}</p>
			<p class="cv-entry__dates label">${entry.dates}</p>
		</header>
		<ul class="cv-entry__bullets">${entry.bullets.map((b) => html`<li>${b}</li>`)}</ul>
		${project ? html`<p><a class="textlink" href="/projects/${project.slug}/">Read the write-up<span class="visually-hidden">: ${project.register}</span></a></p>` : ""}
	</article>`;
}

export function resumePage(ctx: RenderContext): PageOut {
	const { site, pages, resume, projects } = ctx.content;
	const copy = pages.resume;
	const pdf = `/files/${site.resumePdf.file}`;
	const kb = Math.round((ctx.content.fileSizes[site.resumePdf.file] ?? 0) / 1024);
	const body = html`
	<header class="page-head">
		<h1 class="page-head__title display">${copy.title}</h1>
		<p class="page-head__intro">${copy.intro}</p>
		<div class="actions">
			<a class="btn btn--primary" href="${pdf}" download>${site.resumePdf.label}<span class="btn__meta">PDF · ${kb} KB</span></a>
			<a class="btn" href="mailto:${site.contact.email}">Email me</a>
		</div>
	</header>
	<section class="band" aria-labelledby="cv-education">
		${sectionHead("cv-education", "Education")}
		<div class="band__body">
			${resume.education.map(
				(e) => html`<article class="cv-entry">
					<header class="cv-entry__head">
						<h3 class="cv-entry__title">${e.school}</h3>
						<p class="cv-entry__org">${e.degree}</p>
						<p class="cv-entry__dates label">${e.dates} · GPA ${e.gpa}</p>
					</header>
				</article>`,
			)}
		</div>
	</section>
	<section class="band" aria-labelledby="cv-skills">
		${sectionHead("cv-skills", "Skills")}
		<dl class="band__body skills">
			${resume.skills.map((s) => html`<div class="skills__row"><dt class="label">${s.group}</dt><dd>${s.items.join(" · ")}</dd></div>`)}
		</dl>
	</section>
	<section class="band" aria-labelledby="cv-experience">
		${sectionHead("cv-experience", "Work experience")}
		<div class="band__body">${resume.experience.map((e) => resumeEntry(e, projects))}</div>
	</section>
	<section class="band" aria-labelledby="cv-projects">
		${sectionHead("cv-projects", "Projects")}
		<div class="band__body">${resume.projects.map((e) => resumeEntry(e, projects))}</div>
	</section>`;
	return {
		route: "/resume/",
		file: fileFor("/resume/"),
		og: { id: "resume", label: "Resume", title: copy.title },
		html: layout(ctx, {
			seo: {
				route: "/resume/",
				title: copy.seo.title,
				description: copy.seo.description,
				og: "resume",
				jsonLd: [breadcrumbs(ctx, [{ name: "Home", route: "/" }, { name: copy.title, route: "/resume/" }])],
			},
			section: "/resume/",
			body,
		}),
	};
}

export function projectsPage(ctx: RenderContext): PageOut {
	const { site, pages, projects } = ctx.content;
	const copy = pages.projects;
	const groups = Object.entries(site.categories)
		.map(([key, label]) => ({ key, label, items: projects.filter((p) => p.category === key) }))
		.filter((g) => g.items.length);
	const body = html`
	<header class="page-head">
		<h1 class="page-head__title display">${copy.title}</h1>
		<p class="page-head__intro">${copy.intro}</p>
	</header>
	${groups.map(
		(g) => html`<section class="band" aria-labelledby="group-${g.key}">
			${sectionHead(`group-${g.key}`, g.label)}
			${register(g.items)}
		</section>`,
	)}`;
	return {
		route: "/projects/",
		file: fileFor("/projects/"),
		og: { id: "projects", label: "Projects", title: copy.title },
		html: layout(ctx, {
			seo: {
				route: "/projects/",
				title: copy.seo.title,
				description: copy.seo.description,
				og: "projects",
				jsonLd: [breadcrumbs(ctx, [{ name: "Home", route: "/" }, { name: copy.title, route: "/projects/" }])],
			},
			section: "/projects/",
			body,
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
			<p class="crumb label"><a href="/projects/">Projects</a> <span aria-hidden="true">/</span> ${site.categories[project.category]}</p>
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
		${project.figures.length
			? html`<section class="band band--figures" aria-labelledby="gallery">
					${sectionHead("gallery", "Gallery")}
					${figures(ctx.content, project)}
				</section>`
			: ""}
		<nav class="pager" aria-label="More projects">
			${prev ? html`<a class="pager__link pager__link--prev" href="/projects/${prev.slug}/"><span class="label">Previous project</span><span>${prev.register}</span></a>` : html`<span></span>`}
			${next ? html`<a class="pager__link pager__link--next" href="/projects/${next.slug}/"><span class="label">Next project</span><span>${next.register}</span></a>` : html`<a class="pager__link pager__link--next" href="/projects/"><span class="label">Back to</span><span>All projects</span></a>`}
		</nav>
	</article>`;

	return {
		route,
		file: fileFor(route),
		og: { id: `project-${project.slug}`, label: "Projects", title: project.title, metric: featured },
		html: layout(ctx, {
			seo: {
				route,
				title: `${project.register} · ${site.name}`,
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
						keywords: project.tools.join(", "),
					},
					breadcrumbs(ctx, [
						{ name: "Home", route: "/" },
						{ name: "Projects", route: "/projects/" },
						{ name: project.register, route },
					]),
				],
			},
			section: "/projects/",
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
			<a class="btn" href="/projects/">See projects</a>
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
