// Converts a phone video into a small web video in content/media/:
//   <name>.mp4         H.264, at most 720 px on the short side, no audio, no metadata
//                      (phone videos carry GPS location and background audio)
//   <name>-poster.jpg  a still frame shown before the video plays
//
//   npm run import-video -- "<path to original>" <name> [poster time in seconds]
//
// Needs ffmpeg on PATH (winget install Gyan.FFmpeg). Then run `npm run images`
// so the poster gets its responsive sizes.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [source, name, posterAt = "1"] = process.argv.slice(2);
if (!source || !name || !/^[a-z0-9-]+$/.test(name)) {
	console.error('Usage: npm run import-video -- "<original video>" <kebab-name> [poster seconds]');
	process.exit(1);
}

const media = path.join(import.meta.dirname, "..", "content", "media");
const video = path.join(media, `${name}.mp4`);
const posterTmp = path.join(media, `${name}-poster.tmp.png`);
const poster = path.join(media, `${name}-poster.jpg`);

// ffmpeg applies the phone's rotation flag while decoding, so portrait stays portrait.
execFileSync("ffmpeg", [
	"-v", "error", "-y", "-i", source,
	"-map", "0:v:0", "-an", "-map_metadata", "-1", "-map_chapters", "-1",
	"-vf", "scale='if(gt(iw,ih),-2,min(720,iw))':'if(gt(iw,ih),min(720,ih),-2)'",
	"-c:v", "libx264", "-preset", "slow", "-crf", "26", "-profile:v", "high", "-pix_fmt", "yuv420p",
	"-movflags", "+faststart",
	video,
], { stdio: "inherit" });

execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", posterAt, "-i", video, "-frames:v", "1", posterTmp], { stdio: "inherit" });
await sharp(posterTmp).jpeg({ quality: 86, mozjpeg: true }).toFile(poster);
fs.rmSync(posterTmp);

const meta = await sharp(poster).metadata();
console.log(`${name}.mp4  ${Math.round(fs.statSync(video).size / 1024)} KB  ${meta.width}x${meta.height}  no audio, metadata stripped`);
