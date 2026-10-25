// Generates everything image-shaped that the site serves:
//   1. responsive AVIF + WebP sizes of content/media/* -> src/generated/img/
//      plus a manifest (src/generated/images.json) with intrinsic sizes,
//   2. 1200x630 social preview images per page -> public/og/*.jpg
//      (text comes from content/, recorded in src/generated/og.json),
//   3. PNG favicons from public/favicon.svg.
// Unchanged inputs are skipped. Run after adding photos or renaming pages:
//   npm run images
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import sharp from "sharp";
import { renderPages } from "../src/site/build.ts";
import { loadContent, type ImageEntry } from "../src/site/content.ts";

const root = path.resolve(import.meta.dirname, "..");
const mediaDir = path.join(root, "content", "media");
const outDir = path.join(root, "src", "generated", "img");
const manifestFile = path.join(root, "src", "generated", "images.json");
const ogDir = path.join(root, "public", "og");
const ogManifestFile = path.join(root, "src", "generated", "og.json");
const WIDTHS = [400, 640, 800, 1200, 1600];
/** Bump to force every social image to be redrawn after a design change. */
const OG_DESIGN = 8;

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(ogDir, { recursive: true });

const hash = (data: string | Buffer): string => createHash("sha256").update(data).digest("hex").slice(0, 16);
const readJson = <T>(file: string, fallback: T): T =>
	fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as T) : fallback;

// ---------- 1. Responsive images ----------

const previous = readJson<Record<string, ImageEntry>>(manifestFile, {});
const manifest: Record<string, ImageEntry> = {};
const keep = new Set<string>();

for (const file of fs.readdirSync(mediaDir).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort()) {
	const name = file.replace(/\.[^.]+$/, "");
	const input = fs.readFileSync(path.join(mediaDir, file));
	const source = hash(input);
	const meta = await sharp(input).metadata();
	const width = meta.width ?? 0;
	const height = meta.height ?? 0;
	const widths = [...new Set([...WIDTHS.filter((w) => w < width), Math.min(width, WIDTHS.at(-1)!)])];
	const entry: ImageEntry = {
		width,
		height,
		source,
		avif: widths.map((w) => ({ width: w, file: `${name}-${w}.avif` })),
		webp: widths.map((w) => ({ width: w, file: `${name}-${w}.webp` })),
	};
	for (const v of [...entry.avif, ...entry.webp]) keep.add(v.file);

	const fresh =
		previous[name]?.source === source &&
		[...entry.avif, ...entry.webp].every((v) => fs.existsSync(path.join(outDir, v.file)));
	if (!fresh) {
		const isScreenshot = file.endsWith(".png");
		for (const w of widths) {
			const resized = sharp(input).resize({ width: w, withoutEnlargement: true });
			await resized.clone().avif({ quality: isScreenshot ? 62 : 48, effort: 6 }).toFile(path.join(outDir, `${name}-${w}.avif`));
			await resized.clone().webp({ quality: isScreenshot ? 86 : 78, effort: 5 }).toFile(path.join(outDir, `${name}-${w}.webp`));
		}
		console.log(`img  ${name}: ${widths.join(", ")}`);
	}
	manifest[name] = entry;
}

for (const file of fs.readdirSync(outDir)) {
	if (!keep.has(file)) fs.rmSync(path.join(outDir, file));
}
fs.writeFileSync(manifestFile, `${JSON.stringify(manifest, null, "\t")}\n`);

// ---------- 2. Social preview images ----------

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: (Node | string)[]): Node => ({
	type,
	props: { style: { display: "flex", ...style }, children: children.length === 1 ? children[0] : children },
});

const font = (pkg: string, file: string): Buffer => fs.readFileSync(path.join(root, "node_modules", pkg, "files", file));
const fonts = [
	{ name: "Archivo", data: font("@fontsource/archivo", "archivo-latin-300-normal.woff"), weight: 300 as const, style: "normal" as const },
	{ name: "Archivo", data: font("@fontsource/archivo", "archivo-latin-400-normal.woff"), weight: 400 as const, style: "normal" as const },
	{ name: "Mono", data: font("@fontsource/martian-mono", "martian-mono-latin-400-normal.woff"), weight: 400 as const, style: "normal" as const },
];

const C = { ink: "#0b0b0b", line: "#2c2c2c", muted: "#a3a39e", paper: "#efeee9", signal: "#55c3ff" };

const content = loadContent(root);
const pages = renderPages({ content, mode: "development", url: "", date: new Date(0) });
const headshot = await sharp(path.join(mediaDir, "headshot-round.jpg"))
	.resize({ width: 400, height: 400, fit: "cover" })
	.jpeg({ quality: 85 })
	.toBuffer();
const headshotUri = `data:image/jpeg;base64,${headshot.toString("base64")}`;

const mono = (text: string, color = C.muted, size = 20): Node =>
	h("div", { fontFamily: "Mono", fontSize: size, letterSpacing: 1.5, color, textTransform: "uppercase" }, text);

function ogTree(og: (typeof pages)[number]["og"]): Node {
	const isHome = og.id === "home";
	const titleSize = og.title.length > 34 ? 60 : og.title.length > 18 ? 76 : 104;
	const left = h(
		"div",
		{ flexDirection: "column", justifyContent: "space-between", flexGrow: 1 },
		isHome ? mono("Portfolio", C.paper) : h("div", { gap: 28 }, mono(content.site.name, C.paper), mono(og.label)),
		h(
			"div",
			{ fontFamily: "Archivo", fontWeight: 300, fontSize: titleSize, lineHeight: 1, color: C.paper, textTransform: "uppercase", maxWidth: isHome ? 640 : 1040 },
			og.title,
		),
		og.metric
			? h(
					"div",
					{ alignItems: "center", gap: 18 },
					h("div", { width: 10, height: 10, backgroundColor: C.signal }),
					h("div", { fontFamily: "Archivo", fontWeight: 300, fontSize: 64, color: C.paper, lineHeight: 1 }, `${og.metric.value}${og.metric.unit === "%" ? "%" : ` ${og.metric.unit}`}`),
					mono(og.metric.label, C.muted, 18),
				)
			: mono(`${content.site.descriptor} · ${content.site.schoolShort}`, C.muted, 17),
	);
	return h(
		"div",
		{ width: 1200, height: 630, backgroundColor: C.ink },
		h(
			"div",
			{ flexGrow: 1, margin: 40, border: `1px solid ${C.line}`, padding: 44, gap: 40 },
			left,
			isHome
				? h("div", { width: 360, flexShrink: 0, alignItems: "center" }, {
						type: "img",
						props: { src: headshotUri, width: 360, height: 360, style: { borderRadius: 180 } },
					})
				: h("div", { width: 0 }),
		),
	);
}

type OgRecord = { key: string; label: string; title: string };
const ogPrevious = readJson<Record<string, OgRecord>>(ogManifestFile, {});
const ogManifest: Record<string, OgRecord> = {};
for (const page of pages) {
	const { og } = page;
	if (ogManifest[og.id]) continue;
	const key = hash(JSON.stringify({ og, design: OG_DESIGN, headshot: manifest["headshot-round"]?.source }));
	ogManifest[og.id] = { key, label: og.label, title: og.title };
	const file = path.join(ogDir, `${og.id}.jpg`);
	if (ogPrevious[og.id]?.key === key && fs.existsSync(file)) continue;
	const svg = await satori(ogTree(og) as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts });
	const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
	await sharp(png).jpeg({ quality: 88, mozjpeg: true }).toFile(file);
	console.log(`og   ${og.id}`);
}
for (const file of fs.readdirSync(ogDir)) {
	if (!ogManifest[file.replace(/\.jpg$/, "")]) fs.rmSync(path.join(ogDir, file));
}
fs.writeFileSync(ogManifestFile, `${JSON.stringify(ogManifest, null, "\t")}\n`);

// ---------- 3. Favicons ----------

const favicon = fs.readFileSync(path.join(root, "public", "favicon.svg"));
await sharp(favicon, { density: 600 }).resize(180, 180).png().toFile(path.join(root, "public", "apple-touch-icon.png"));
await sharp(favicon, { density: 300 }).resize(32, 32).png().toFile(path.join(root, "public", "favicon-32.png"));

console.log(`done: ${Object.keys(manifest).length} images, ${Object.keys(ogManifest).length} social previews`);
