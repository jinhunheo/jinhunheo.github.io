// Copies a photo or screenshot into content/media/ ready for the site:
// auto-rotated, at most 2400 px on the long edge, and with all metadata
// (EXIF, GPS location, camera serials) removed.
//
//   npm run import-media -- "<path to original>" <name>.jpg|png
//
// Then run `npm run images` to regenerate the responsive sizes.
import path from "node:path";
import sharp from "sharp";

const [source, name] = process.argv.slice(2);
if (!source || !name || !/^[a-z0-9-]+\.(jpg|png)$/.test(name)) {
	console.error('Usage: npm run import-media -- "<original file>" <kebab-name>.jpg|png');
	process.exit(1);
}

const out = path.join(import.meta.dirname, "..", "content", "media", name);
const image = sharp(source)
	.rotate()
	.resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true });
const info = name.endsWith(".png")
	? await image.png({ compressionLevel: 9 }).toFile(out)
	: await image.jpeg({ quality: 88, mozjpeg: true }).toFile(out);

const meta = await sharp(out).metadata();
if (meta.exif || meta.xmp || meta.iptc) throw new Error(`${name} still has metadata`);
console.log(`${name}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB  metadata stripped`);
