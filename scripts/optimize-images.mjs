// Asset pipeline: optimises the source art in PORTFOLIO ASSETS into public/assets.
// Usage: node scripts/optimize-images.mjs [path-to-PORTFOLIO-ASSETS]
// Default source is the folder next to this repo on the desktop.

import sharp from 'sharp';
import { mkdir, writeFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SRC = resolve(process.argv[2] ?? join(ROOT, '..', 'PORTFOLIO ASSETS'));
const OUT = join(ROOT, 'public', 'assets');

const report = [];
async function log(file) {
  const { size } = await stat(file);
  report.push([file.replace(ROOT, '').replace(/\\/g, '/'), size]);
}

// Write one image as AVIF + WebP, plus a PNG fallback for the small size only
// (large PNGs run 0.5–1 MB, and every current browser takes WebP/AVIF).
async function writeSet(pipeline, base, { png = false } = {}) {
  const avif = `${base}.avif`;
  const webp = `${base}.webp`;
  await pipeline.clone().avif({ quality: 55, effort: 6 }).toFile(avif);
  await pipeline.clone().webp({ quality: 80, alphaQuality: 90, effort: 6 }).toFile(webp);
  await Promise.all([log(avif), log(webp)]);
  if (png) {
    const file = `${base}.png`;
    await pipeline.clone().png({ palette: true, quality: 85, effort: 10, compressionLevel: 9 }).toFile(file);
    await log(file);
  }
}

// ---------------------------------------------------------------- Cards
const CARD_W = [500, 1000];
const CARD_H = (w) => Math.round(w * 1.4); // fronts are 5:7
const cards = {
  designer: 'Designer (3).png',
  runner: 'Runner (1).png',
  cook: 'Cook (1).png',
  'anime-lover': 'Anime Lover (1).png',
  artist: 'Artist (1).png',
  samurai: 'Samurai (1).png',
  dojo: 'Dojo.png',
  // The back's source ratio (0.749) is wider than the fronts (0.714);
  // it is fitted to the front size so both faces line up when a card flips.
  back: 'Card backside.png',
};

async function doCards() {
  const dir = join(OUT, 'cards');
  await mkdir(dir, { recursive: true });
  for (const [name, file] of Object.entries(cards)) {
    for (const w of CARD_W) {
      const img = sharp(join(SRC, 'Cards', file)).resize(w, CARD_H(w), { fit: 'fill', kernel: 'lanczos3' });
      await writeSet(img, join(dir, `${name}-${w}`), { png: w === CARD_W[0] });
    }
  }
}

// ---------------------------------------------------------------- Pack
// The crimp strip and body share the same 5028px width and stack exactly,
// so they are scaled by the same factor to keep them aligned.
async function doPack() {
  const dir = join(OUT, 'pack');
  await mkdir(dir, { recursive: true });
  for (const w of [600, 1000]) {
    for (const [name, file] of [
      ['pack-top', '01_trading_cards_aayudh_top_crimp.png'],
      ['pack-body', '01_trading_cards_aayudh_bottom.png'],
    ]) {
      const img = sharp(join(SRC, 'Cards', file), { limitInputPixels: false }).resize({ width: w, kernel: 'lanczos3' });
      await writeSet(img, join(dir, `${name}-${w}`), { png: w === 600 });
    }
  }

  // Open Graph image: full pack on ink, 1200x630.
  const pack = await sharp(join(SRC, 'Cards', '01_trading_cards_aayudh.png')).resize({ height: 560 }).toBuffer();
  const og = join(OUT, '..', 'og-image.jpg');
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#120603' } })
    .composite([{ input: pack, gravity: 'centre' }])
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(og);
  await log(og);
}

// ---------------------------------------------------------------- Stamps
// Red seals on white paper. Ink strength comes from "redness" (R − G):
// the paper and its grey shading have R ≈ G, ink has R ≫ G. That becomes
// the alpha channel, the colour is set to the brand red, so only ink remains
// and the white cut-outs turn transparent.
const RED = { r: 0xea, g: 0x2b, b: 0x1f };
const stamps = {
  trident: 'logo_stamp.png',
  cat: 'cat_stamp.png',
  headphones: 'headphones_stamp.png',
  lightning: 'lightning_stamp.png',
  helmet: 'helmet_stamp.png',
  stars: 'dragonball_stamp.png',
};

async function doStamps() {
  const dir = join(OUT, 'stamps');
  await mkdir(dir, { recursive: true });
  for (const [name, file] of Object.entries(stamps)) {
    const { data, info } = await sharp(join(SRC, 'Stamps', file)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const px = info.width * info.height;
    const out = Buffer.alloc(px * 4);
    for (let i = 0; i < px; i++) {
      const r = data[i * 3];
      const g = data[i * 3 + 1];
      const redness = r - g;
      const a = Math.max(0, Math.min(1, (redness - 30) / 120));
      out[i * 4] = RED.r;
      out[i * 4 + 1] = RED.g;
      out[i * 4 + 2] = RED.b;
      out[i * 4 + 3] = Math.round(a * 255);
    }
    const cut = sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } });
    // Crop to the ink, pad slightly, square it, then scale to 300px.
    const trimmed = await cut.trim({ threshold: 10 }).png().toBuffer();
    const img = sharp(trimmed)
      .resize(300, 300, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({ top: 6, bottom: 6, left: 6, right: 6, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .resize(300, 300);
    const webp = join(dir, `${name}.webp`);
    const png = join(dir, `${name}.png`);
    await img.clone().webp({ quality: 85, alphaQuality: 90 }).toFile(webp);
    await img.clone().png({ palette: true, compressionLevel: 9 }).toFile(png);
    await Promise.all([log(webp), log(png)]);
  }
}

// ---------------------------------------------------------------- Favicons
async function doFavicons() {
  const svg = join(ROOT, 'public', 'favicon.svg');
  const pub = join(ROOT, 'public');
  for (const [file, size] of [
    ['apple-touch-icon.png', 180],
    ['icon-192.png', 192],
    ['icon-512.png', 512],
  ]) {
    await sharp(svg, { density: 300 }).resize(size, size).png().toFile(join(pub, file));
    await log(join(pub, file));
  }
  // favicon.ico: a single 32px PNG wrapped in an ICO container.
  const png32 = await sharp(svg, { density: 300 }).resize(32, 32).png().toBuffer();
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count
  header.writeUInt8(32, 6); // width
  header.writeUInt8(32, 7); // height
  header.writeUInt8(0, 8); // palette
  header.writeUInt8(0, 9); // reserved
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png32.length, 14); // image size
  header.writeUInt32LE(22, 18); // image offset
  const ico = join(pub, 'favicon.ico');
  await writeFile(ico, Buffer.concat([header, png32]));
  await log(ico);
}

// ---------------------------------------------------------------- Work covers
// One 16:10 cover per project for the Work drum.
async function doCovers() {
  const dir = join(OUT, 'work');
  await mkdir(dir, { recursive: true });
  const W = 1200;
  const H = 750;

  // MemorEase: patient + caregiver home screens side by side on a warm ground.
  const phoneH = Math.round(H * 0.86);
  // Trim each PNG's transparent padding first so both phones match in size.
  const phone = async (f) => {
    const trimmed = await sharp(join(SRC, 'MemorEase', f)).trim({ threshold: 5 }).toBuffer();
    return sharp(trimmed).resize({ height: phoneH }).toBuffer();
  };
  const [patient, caregiver] = await Promise.all([phone('Patient_screen_main.png'), phone('Caregiver_screen_main.png')]);
  const pw = (await sharp(patient).metadata()).width;
  const memorease = sharp({ create: { width: W, height: H, channels: 3, background: '#EADFCB' } })
    .composite([
      { input: patient, left: Math.round(W / 2 - pw - 24), top: Math.round((H - phoneH) / 2) },
      { input: caregiver, left: Math.round(W / 2 + 24), top: Math.round((H - phoneH) / 2) },
    ]);
  const memoreaseBuf = await memorease.png().toBuffer();

  // TEDx: the site's main screen, with the black margins trimmed off.
  const tedxBuf = await sharp(join(SRC, 'TEDx', 'TEDxMITWPU_mainscreen.png'))
    .trim({ background: '#000000', threshold: 12 })
    .resize(W, H, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer();

  // Path of Stillness: title screen; nearest-neighbour keeps the pixel art crisp.
  const posBuf = await sharp(join(SRC, 'Path Of Stillness', 'mainscreen_ss.jpeg'))
    .resize(W, H, { fit: 'cover', position: 'centre', kernel: 'nearest' })
    .png()
    .toBuffer();

  for (const [name, buf] of [['memorease', memoreaseBuf], ['tedx', tedxBuf], ['path-of-stillness', posBuf]]) {
    for (const w of [800, 1200]) {
      const kernel = name === 'path-of-stillness' ? 'nearest' : 'lanczos3';
      const img = sharp(buf).resize({ width: w, kernel });
      const base = join(dir, `${name}-${w}`);
      await img.clone().avif({ quality: 55, effort: 6 }).toFile(`${base}.avif`);
      await img.clone().webp({ quality: 80, effort: 6 }).toFile(`${base}.webp`);
      await Promise.all([log(`${base}.avif`), log(`${base}.webp`)]);
      if (w === 800) {
        await img.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(`${base}.jpg`);
        await log(`${base}.jpg`);
      }
    }
  }
}

const only = process.env.ONLY?.split(',');
const tasks = { cards: doCards, pack: doPack, stamps: doStamps, favicons: doFavicons, covers: doCovers };
for (const [name, fn] of Object.entries(tasks)) {
  if (only && !only.includes(name)) continue;
  console.log(`→ ${name}`);
  await fn();
}

for (const [file, size] of report) console.log(`${(size / 1024).toFixed(0).padStart(6)} KB  ${file}`);
