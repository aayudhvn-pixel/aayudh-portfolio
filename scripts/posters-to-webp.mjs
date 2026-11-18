// Converts the video poster frames ffmpeg writes (*-poster.jpg) to WebP,
// which is smaller, and removes the JPEGs. Run by build-case-media.sh.
// Usage: node scripts/posters-to-webp.mjs
import sharp from 'sharp';
import { readdirSync, statSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const dirs = ['public/assets/case', 'public/assets/films/clips'];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (name.endsWith('-poster.jpg')) yield full;
  }
}

for (const d of dirs) {
  for (const jpg of walk(join(ROOT, d))) {
    const webp = jpg.replace(/\.jpg$/, '.webp');
    await sharp(jpg).webp({ quality: 78 }).toFile(webp);
    const before = statSync(jpg).size;
    unlinkSync(jpg);
    console.log(`${(before / 1024).toFixed(0)} KB → ${(statSync(webp).size / 1024).toFixed(0)} KB  ${webp.replace(ROOT, '')}`);
  }
}
