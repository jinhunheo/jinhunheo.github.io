import { defineConfig } from "cf/config";

// Two Workers from one project, chosen with --mode:
//   cf deploy --mode staging  -> jinhun-heo-portfolio-staging on workers.dev (public, noindex)
//   cf deploy                 -> jinhun-heo-portfolio (production; needs approval and a domain)
// The site is static assets only: no Worker code runs, so it stays within Workers Free.
export default defineConfig(({ mode }) => {
	const staging = mode === "staging";
	return {
		worker: {
			name: staging ? "jinhun-heo-portfolio-staging" : "jinhun-heo-portfolio",
			compatibilityDate: "2026-10-19",
			observability: { enabled: true },
			assets: {
				notFoundHandling: "404-page",
				htmlHandling: "auto-trailing-slash",
			},
			// Staging is reachable only on workers.dev. Production gets a custom
			// domain at launch (pre-launch task), so it has no workers.dev route.
			workersDev: staging,
			previewUrls: false,
		},
	};
});
