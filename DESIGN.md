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

What survives from DATUM, kept small: project **title blocks** (type, organisation, role,
dates, tools) and results drawn as **dimension lines** with arrowheads on project pages.
They are the engineering accent; everything else stays plain.

## Logo

A **JH monogram**: geometric J and H knocked out of a rounded square (radius 9 on a 32
grid, matching the site's rounded corners), strokes 2.6 with square ends. It inverts
with the theme (dark tile on white, light tile on dark). The same drawing is the favicon.

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

- **Header** on every page: JH logo (with the name on wider screens) on the left,
  **Projects** centred (it scrolls to the projects on the home page), and LinkedIn, mail
  and the light/dark toggle on the right. The mail icon copies the address (with a short
  "Copied" note) and opens the visitor's mail app.
- **Home**: round headshot beside "Hey, I'm Jinhun." and the bio (Jinhun's own words,
  verbatim). Below it, `#projects`: every project as a row with its card image (or an
  empty rounded space until one is added), meta line, title, summary, "Learn more" and
  any report.
- **Project page**: title, summary, report button (if any), title block, dimensioned
  results, write-up, a Report section, then a gallery of photos, CAD plates and videos
  (only when there are any), then previous / next.
- **Footer**: "© Jinhun Heo 2026".

Rounds 2–3 removed the Contact, Resume and Projects-list pages; the site is the home
page plus one page per project.

### Phone, designed on purpose

- The same header fits a 375 px screen: logo mark, centred Projects, three 40 px icons.
- Home stacks portrait, greeting, bio, then project rows with the image on top.
- Title blocks become a two-column grid; tap targets are at least 40 px.

## Media

- Photos and CAD screenshots go through `npm run import-media` (EXIF/GPS stripped) and
  `npm run images` (AVIF + WebP sizes). Portrait plates share a 3:4 frame, landscape
  plates 4:3, so gallery rows line up.
- Videos go through `npm run import-video`: H.264 MP4, at most 720 px on the short side,
  **no audio and no metadata** (phone videos carry location and background voices). They
  show a poster frame, load nothing until played, never autoplay, and have a caption
  track describing what happens.
- Documents (the reaction wheel report) open in the browser's own PDF reader from
  `/files/…`.

## Motion

Subtle and optional: dimension lines draw in, rows and images lift slightly as they
scroll into view (CSS scroll-driven animations where supported), card images scale 2 %
on hover with a mouse, and themes cross-fade. `prefers-reduced-motion: reduce` turns
all of it off.

## JavaScript

No framework (nothing here benefits from React). One small vanilla module, all
progressive enhancement: theme toggle, image viewer for photos and CAD (dialog with arrow
keys, Escape and focus return), and the header email copy. Every page is complete HTML without it.

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
