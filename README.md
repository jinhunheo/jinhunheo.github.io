# Jinhun Heo, portfolio

Static site built with Vite and deployed to Cloudflare Workers (static assets only,
Workers Free) with the `cf` CLI. Design direction: [DESIGN.md](DESIGN.md).

## Where things live

| Path | What |
|---|---|
| `content/site.yaml` | Name, contact details, interests, nav, URLs |
| `content/pages.yaml` | Copy and search descriptions for each page |
| `content/resume.yaml` | The resume as data (keep in step with the PDF) |
| `content/projects/*.md` | One file per project: frontmatter (title block, metrics, figures) + write-up |
| `content/media/` | Source photos and CAD screenshots (metadata stripped) |
| `content/files/` | Downloadable files, served at `/files/…` |
| `src/site/` | Templates that render the content to HTML (no copy in here) |
| `src/client/` | CSS, fonts and the small progressive-enhancement script |
| `src/generated/` | Image sizes and manifests from `npm run images` (committed) |
| `public/` | Favicons and social preview images, served as-is |

Anything in `content/` that starts with `TODO:` shows as a dashed box on staging, and
`npm run build` (production) refuses to run until it's filled in.

## Common tasks

```sh
npm install
npm run dev                 # local preview at http://localhost:5173
```

Add a photo or CAD screenshot (strips EXIF/GPS, then regenerates sizes):

```sh
npm run import-media -- "C:/path/to/IMG_1234.jpeg" project-part-name.jpg
npm run images
```

Then reference it as a figure in the project's Markdown frontmatter (`image: project-part-name`).
Run `npm run images` again after renaming a page title, so its social preview matches.

## Checks and deploys

```sh
npm run check               # type check + tests + cf deploy --dry-run (staging)
npm run deploy:staging      # jinhun-heo-portfolio-staging on workers.dev (noindex)
npm run deploy              # production: only after approval, with a domain set
```

`cf build` runs `vite build` directly, not the package.json scripts, so type checks and
tests run separately (`npm run typecheck`, `npm test`).
