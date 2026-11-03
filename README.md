# Jinhun Heo, portfolio

Static site built with Vite and deployed to Cloudflare Workers (static assets only,
Workers Free) with the `cf` CLI. Design direction: [DESIGN.md](DESIGN.md).

## Where things live

| Path | What |
|---|---|
| `content/site.yaml` | Name, contact details, interests, nav, URLs |
| `content/pages.yaml` | Copy and search descriptions for each page |
| `content/resume.yaml` | Resume data (education, skills) used in the search-engine profile; no page shows it now |
| `content/projects/*.md` | One file per project: frontmatter (title block, metrics, gallery) + write-up |
| `content/media/` | Source photos and CAD screenshots (metadata stripped) |
| `content/files/` | Downloads (PDFs) and video captions, served at `/files/…` |
| `src/site/` | Templates that render the content to HTML (no copy in here) |
| `src/client/` | CSS, fonts and the small progressive-enhancement script |
| `src/generated/` | Image sizes and manifests from `npm run images` (committed) |
| `public/` | Favicons and social preview images, served as-is |

Anything in `content/` that starts with `TODO:` blocks `npm run build` (production) until
it's filled in. Today that is only the production domain in `content/site.yaml`.

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

Then reference it in the project's Markdown frontmatter: as a gallery figure
(`image: project-part-name`), and/or as the home page card image (`cover: project-part-name`).
Projects without a `cover` show an empty rounded space on the home page.
To put several images in one gallery spot (swiped through with arrows), list them under
`slides:` instead of `image:`. Each slide has its own `caption`, or the group gets one
shared `caption` (see the enclosure group in `content/projects/robotic-vision-lab.md`).
The group's frame follows its first slide, so crop photos in a group to match it.
Use `kind: cad` for anything on a white background (CAD, drawings, product images).

Add a video (needs ffmpeg: `winget install Gyan.FFmpeg`). It becomes a silent MP4 with
no metadata, plus a poster frame:

```sh
npm run import-video -- "C:/path/to/IMG_1234.MOV" project-demo 1.5
npm run images
```

Then add it as a figure with `kind: video`, `video: project-demo` and
`image: project-demo-poster`, and put a one-line caption file at
`content/files/project-demo.vtt` (copy an existing one).

Add a PDF report to a project: copy it into `content/files/` and list it under
`documents:` in the project's frontmatter (see `content/projects/reaction-wheel.md`).

Run `npm run images` again after renaming a page title, so its social preview matches.

## Checks and deploys

```sh
npm run check               # type check + tests + cf deploy --dry-run (staging)
npm run deploy:staging      # jinhun-heo-portfolio-staging on workers.dev (noindex)
npm run deploy              # production: only after approval, with a domain set
```

`cf build` runs `vite build` directly, not the package.json scripts, so type checks and
tests run separately (`npm run typecheck`, `npm test`).
