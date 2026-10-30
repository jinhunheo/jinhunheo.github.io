# Design direction

## Where it landed

Round 1 shipped a dark "engineering drawing set" concept (DATUM): sheet numbers,
drawing grid, monotone black, uppercase expanded type. Jinhun's feedback pulled it
toward something quieter, and that is the current direction:

**Simple, white, plenty of space, like Google's about pages. The work and the
person carry the page, not the frame.**

Two references set the tone:
- about.google: white background, sentence-case headings, generous whitespace,
  rounded image corners, nothing decorative in the background.
- ramitkrishnan.com: a friendly greeting beside a round portrait, then projects as
  rows of image on the left and title, short text and a "Learn more" button on the right.

What survives from DATUM, kept small: the round **datum mark** logo, project **title
blocks** (type, organisation, role, dates, tools) and results drawn as **dimension
lines** with arrowheads on project pages. They are the engineering accent; everything
else stays plain.

## Colour and themes

White by default, dark on request. The header toggle (moon / sun) switches themes;
the choice is saved in the visitor's browser and applied before first paint by a tiny
inline script, allowed by hash in the Content-Security-Policy.

| Token          | Light     | Dark      | Use |
|----------------|-----------|-----------|-----|
| `--bg`         | `#ffffff` | `#0f0f10` | page |
| `--bg-2`       | `#f4f5f6` | `#19191b` | hover fills |
| `--text`       | `#1f1f1f` | `#ececea` | text; primary button fill |
| `--muted`      | `#5f6368` | `#a3a39e` | secondary text (≥ 6:1) |
| `--line`       | `#e4e5e7` | `#2c2c2e` | rules |
| `--accent`     | `#1a73e8` | `#8ab4f8` | focus ring, current-page marker, dimension arrowheads |
| `--plate`      | `#f4f5f6` | `#e9e8e3` | CAD screenshot plates |
| `--placeholder`| `#eceef0` | `#1d1d20` | empty image spaces |

Photos are always in full colour. CAD screenshots sit on plates; their white
viewport background blends into the plate. The full-screen image viewer is always dark.

## Type

One family: **Archivo** (variable), self-hosted, preloaded, `font-display: optional`
so nothing shifts when it arrives. Sentence case everywhere, weight 500 for headings
with slightly tight tracking, 400 for body. Small metadata uses the `.label` style
(13 px), not a second font.

Sizes (fluid): greeting 36 → 64 px · page titles 40 → 72 px · project titles 32 → 60 px
· card titles 22 → 30 px · body 16 → 17 px · labels 13–15 px.

## Pages

- **Home**: round headshot beside "Hey, I'm Jinhun." and the bio (Jinhun's own words,
  verbatim). Below it, every project as a row: image (or an empty rounded space until
  a cover is added), meta line, title, summary, "Learn more".
- **Resume**: the resume as HTML with a PDF download, sections with the heading in
  the left margin.
- **Projects**: the list grouped by Internship / Research / Student team, each row
  linking to its page.
- **Project page**: title, summary, title block, dimensioned results, write-up, then a
  gallery (only when there are images), then previous / next.
- **Footer** on every page: "© Jinhun Heo 2026" on the left; LinkedIn and mail icons
  on the right. The mail icon copies the address (with a short "Copied" note) and
  opens the visitor's mail app.

There is no contact page (removed in round 2); the footer icons and the resume's
"Email me" button cover contact.

### Phone, designed on purpose

- Navigation is a fixed bottom bar (Home, Resume, Projects) in thumb reach; the theme
  toggle stays top right.
- Home stacks portrait, greeting, bio, then project rows with the image on top.
- Title blocks become a two-column grid; tap targets are at least 44 px.

## Motion

Subtle and optional: dimension lines draw in, rows and images lift slightly as they
scroll into view (CSS scroll-driven animations where supported), card images scale 2 %
on hover with a mouse, and themes cross-fade. `prefers-reduced-motion: reduce` turns
all of it off.

## JavaScript

No framework (nothing here benefits from React). One small vanilla module, all
progressive enhancement: theme toggle, image viewer (dialog with arrow keys, Escape and
focus return), and the footer email copy. Every page is complete HTML without it.

## Content rules

- All words and data live in `content/` (YAML + Markdown). Templates hold only
  structural labels ("Type", "Role", "Gallery", "Learn more" comes from content).
- Copy is plain, first person and specific. No invented facts.
- A value starting with `TODO:` blocks the production build; none are shown on pages.

## Accessibility

One `h1` per page, no skipped heading levels, landmarks, skip link, visible focus ring
in `--accent`, alt text on every meaningful image (home card images are decorative
duplicates of their titles), labelled icon buttons, contrast ≥ 4.5:1 in both themes.

## Do not

Gradient heroes, "Welcome to…", rows of identical icon cards, emoji, stock people,
testimonials, lorem ipsum, background grids or textures, logos that aren't Jinhun's
own (the lab logo stays out).
