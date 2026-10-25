# Design direction: DATUM

## The idea

A datum is the fixed reference every other dimension on an engineering drawing is
measured from. The site borrows the quiet parts of an engineering drawing, without
the paperwork:

- every project has its own **title block** (type, organisation, role, dates, tools),
- every result is **dimensioned**: numbers from the work are drawn as dimension lines,
  not dropped into bullet points,
- a faint drawing grid sits behind every page.

Navigation and labels stay plain: Home, Resume, Projects, Contact. No sheet numbers,
revision stamps or figure numbers (removed at Jinhun's request, first feedback round).

The point of the metaphor is the brief's second "site you love": *draw the focus to
actual experience and work*. A recruiter skimming on a phone should see measured
outcomes (67 % faster assembly, 0.5 s stop, 80 % fewer ID switches) before adjectives.
Nothing on the site says "passionate" or "innovative"; the drawing set does that job.

The tone is the opposite of funky: quiet, exact, a little cold. Futuristic comes from
precision (hairlines, wide type, mono annotations, a working grid), not from glow,
gradients or 3D.

**Three words:** exact, quiet, instrumented.

## Colour

Monotone black, with white paper for drawings, and one signal colour.

| Token        | Value     | Use |
|--------------|-----------|-----|
| `--ink`      | `#0b0b0b` | page background |
| `--ink-2`    | `#141414` | raised surfaces (title blocks, bottom nav) |
| `--line`     | `#2c2c2c` | hairlines, grid, table rules |
| `--muted`    | `#a3a39e` | secondary text (≥ 7:1 on ink) |
| `--paper`    | `#efeee9` | primary text, and the "paper" plates CAD drawings sit on |
| `--paper-ink`| `#151515` | text on paper plates |
| `--signal`   | `#55c3ff` | Cherenkov blue, used **only** for focus rings, the current-page marker and dimension arrowheads |

The signal colour is the one big swing: it is the blue glow of a reactor pool, a nod to
the nuclear-robotics goal. It is never used for large areas, buttons or text blocks. If it
feels like too much, set `--signal` to `--paper` and the site becomes pure monotone.

Photos are always shown **in full colour** (Jinhun's call: the hardware is the point).
CAD screenshots sit on **paper plates** (`--paper`), like drawings pinned to a dark
table; their white viewport background blends into the paper.

## Type

- **Archivo** (variable, width + weight). Display set *expanded* (`wdth` 125) and light
  (`wght` 250–350) in caps for the name and page titles: wide, engineered, calm. Body in
  normal width, 400, 17–18 px, line-height 1.55.
- **Martian Mono** (variable). Annotations only: labels, title-block keys,
  dimension values, nav. Uppercase, tracked +0.06 em, 11–13 px.

Two families, both self-hosted woff2, preloaded, `font-display: optional` so the layout
never shifts when fonts arrive (CLS target 0). Latin subset only.

Scale (fluid, `clamp`): name 44 → 168 px · page title 34 → 96 px · section heading
22 → 32 px · body 17 → 18 px · mono label 11 → 12 px.

## Layout

- A visible **12-column drawing grid**: faint vertical hairlines behind the content on
  desktop (4 columns on phone). Content snaps to it.
- **Home** is one screen: round headshot on the left; name, Jinhun's bio (verbatim),
  buttons and a four-cell spec row on the right, sized so name, bio and headshot all fit
  without scrolling on a 1280×600 laptop window and up. Then only "Get in touch".
- **Title block**: project pages open with a bordered table, the same anatomy as the
  corner block of a drawing: TYPE / ORGANISATION / ROLE / DATES / TOOLS.
- **Dimension callouts**: a value centred on a hairline with arrowheads at both ends,
  label underneath. Used on home ("Measured") and on every project page.
- **Register** (projects index): a bill-of-materials table rather than cards: project,
  organisation, role, dates, key figure, grouped under *Internship*, *Research* and
  *Student team*. One row per project, the whole row is the link.
- **Plates**: images sit on a gallery grid with plain captions; landscape plates share a
  4:3 frame so rows line up.

### Phone, designed on purpose

Most recruiters will open this from a link on a phone, so:

- The nav moves to a **fixed bottom instrument bar** (four mono labels, 56 px tall,
  thumb reach, safe-area aware). Desktop keeps a top header.
- Title blocks become a two-column key/value grid; the register becomes stacked rows
  with the key figure right-aligned; dimension callouts stack full-width.
- The name fills the width on one line; the round headshot sits beside the spec list,
  above the bio.
- Email and phone are big tap targets (≥ 48 px) on the contact page.

## Motion

Subtle, and only where it explains structure:

- On load, hairlines of the title block and dimension lines **draw in** (scaleX from
  0 → 1, 600 ms, ease-out), values fade up 4 px.
- Grid lines and register rows reveal on scroll with CSS scroll-driven animation where
  the browser supports it; otherwise everything is simply visible.
- `prefers-reduced-motion: reduce` turns all of it off. No parallax, no cursor
  effects, no scroll-jacking.

## Interaction and JavaScript

No framework. React is not used, since no interaction here benefits from it. Vanilla
TypeScript, progressive enhancement, < 3 kB:

- image viewer: JS turns each plate into a button that opens the image full-screen in
  a `<dialog>`, with arrow-key stepping, Escape to close and focus return,
- "copy email" button on the contact page.

Every page is complete HTML without JavaScript.

## Content rules

- All words and data live in `content/` (YAML + Markdown). Templates in `src/site/` hold
  no copy beyond structural labels ("Type", "Role", "Gallery").
- Copy is plain, first person, specific: what the part was, what problem it solved,
  what number moved. No "welcome" and no invented facts. The home bio is Jinhun's own
  wording, kept exactly as written.
- Missing facts are written as `TODO:` in content. They render as dashed boxes on
  staging, and a production build fails while any remain.

## Accessibility

Real heading order (one `h1` per page), landmarks, skip link, visible focus ring in
`--signal`, alt text for every image (from content), tap targets ≥ 44 px, contrast ≥
4.5:1 for all text (mono labels use `--muted`, not darker greys), tables used only for
tabular data with headers.

## Do not

Gradient heroes, "Welcome to…", three identical icon cards, emoji, stock people,
testimonials, lorem ipsum, glassmorphism, neon glow, rounded pill buttons, parallax.
No logos or marks that aren't Jinhun's own (the lab's logo is not used).
