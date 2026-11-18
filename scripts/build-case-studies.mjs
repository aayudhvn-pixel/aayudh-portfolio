// Generates the case study pages (/work/<slug>/index.html) from
// content/case-studies/case-studies.mjs and the image manifest
// content/case-studies/media.json.
// Usage: node scripts/build-case-studies.mjs
// Re-run after editing the content; the pages themselves are build output
// (edit the content file, not the HTML).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { CASES, ORDER } from '../content/case-studies/case-studies.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const MEDIA = JSON.parse(readFileSync(join(ROOT, 'content/case-studies/media.json'), 'utf8'));

// The trident symbol, shared with the home page sprite.
const home = readFileSync(join(ROOT, 'index.html'), 'utf8');
const trident = home.match(/<symbol id="i-trident"[\s\S]*?<\/symbol>/)[0];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inline = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');

// Column widths in CSS px, for the img sizes attribute.
const COL = { text: 704, narrow: 768, wide: 1152 };

function img(slug, item, colPx) {
  if (item.raw === 'x-mark') {
    return `<img src="/assets/case/tedx/x-mark-900.webp" alt="${esc(item.alt)}" width="900" height="849" loading="lazy" decoding="async" />`;
  }
  const m = MEDIA[slug][item.img];
  if (!m) throw new Error(`${slug}: no media for ${item.img}`);
  const src = (w) => `/assets/case/${slug}/${item.img}-${w}.webp`;
  const srcset = m.widths.map((w) => `${src(w)} ${w}w`).join(', ');
  const sizes = `(max-width: 860px) 100vw, ${Math.round(colPx)}px`;
  return `<img src="${src(m.widths.at(-1))}" srcset="${srcset}" sizes="${sizes}" alt="${esc(item.alt)}" width="${m.width}" height="${m.height}" loading="lazy" decoding="async" />`;
}

function video(slug, v) {
  const base = `/assets/case/${slug}/${v.src ?? v.video}`;
  // Muted loop with controls; case.js plays it only while on screen.
  return `<video muted loop playsinline controls preload="none" poster="${base}-poster.jpg" width="${v.w}" height="${v.h}" aria-label="${esc(v.label)}" data-autoplay>
            <source src="${base}.mp4" type="video/mp4" />
          </video>`;
}

function figure(slug, f, cls = '') {
  const size = f.size ?? 'text';
  const classes = ['case-fig', `case-${size === 'text' ? 'col' : size === 'narrow' ? 'col' : 'wide'}`, cls];
  if (f.plain) classes.push('is-plain');
  if (f.pixel) classes.push('is-pixel');
  const media = f.video ? video(slug, f.video) : f.src ? video(slug, f) : img(slug, f, COL[size]);
  const cap = f.caption ?? f.video?.caption;
  return `<figure class="${classes.filter(Boolean).join(' ')}">
          ${media}${cap ? `\n          <figcaption>${inline(cap)}</figcaption>` : ''}
        </figure>`;
}

function grid(slug, g) {
  const size = g.size ?? 'wide';
  const colPx = COL[size] / g.cols;
  const cls = ['case-grid', size === 'wide' ? 'case-wide' : 'case-col', g.steps && 'is-steps', g.screens && 'is-screens', g.equal && 'is-equal']
    .filter(Boolean)
    .join(' ');
  // Equal-height rows: each figure grows in proportion to its aspect ratio.
  const ratio = (it) => {
    if (it.raw === 'x-mark') return 900 / 849;
    if (it.video) return it.w / it.h;
    const m = MEDIA[slug][it.img];
    return m.width / m.height;
  };
  const items = g.items
    .map((it) => {
      const cl = [it.plain && 'is-plain', it.pixel && 'is-pixel'].filter(Boolean).join(' ');
      const media = it.video ? video(slug, it) : img(slug, it, colPx);
      const flex = g.equal ? ` style="flex: ${ratio(it).toFixed(3)} 1 0"` : '';
      return `<figure class="case-fig ${cl}"${flex}>
            ${media}${it.caption ? `\n            <figcaption>${inline(it.caption)}</figcaption>` : ''}
          </figure>`;
    })
    .join('\n          ');
  const width = g.max ?? (size === 'narrow' ? '48rem' : null);
  // ratio: every image/video in the row takes one shape (e.g. '9 / 16'), so a
  // recording and screenshots of slightly different sizes line up exactly.
  const shape = g.ratio ? `; --media-ratio: ${g.ratio}` : '';
  return `<div class="${cls}${g.ratio ? ' is-uniform' : ''}" style="--cols: ${g.cols}${width ? `; width: min(100%, ${width})` : ''}${shape}">
          ${items}
        </div>`;
}

function compare(slug, c) {
  const side = (s, kind) => `<div>
            <p class="case-compare__label is-${kind}">${esc(s.label)}</p>
            <div class="case-grid">
              ${s.items.map((n, i) => `<figure class="case-fig">${img(slug, { img: n, alt: `${s.alt} ${i + 1}` }, COL.wide / 6)}</figure>`).join('\n              ')}
            </div>
          </div>`;
  return `<div class="case-compare case-wide case-fig">
          ${side(c.before, 'before')}
          ${side(c.after, 'after')}
        </div>`;
}

function table(t) {
  return `<div class="case-table-wrap">
          <table class="case-table">
            <thead><tr>${t.head.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
            <tbody>
              ${t.rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('\n              ')}
            </tbody>
          </table>
        </div>`;
}

function block(slug, b) {
  if (b.p) return `<p>${inline(b.p)}</p>`;
  if (b.impact) return `<p class="case-impact">${inline(b.impact)}</p>`;
  if (b.ul) return `<ul>\n          ${b.ul.map((li) => `<li>${inline(li)}</li>`).join('\n          ')}\n        </ul>`;
  if (b.ol)
    return `<ol>\n          ${b.ol.map(([lead, text]) => `<li><strong>${inline(lead)}</strong> ${inline(text)}</li>`).join('\n          ')}\n        </ol>`;
  if (b.table) return table(b.table);
  if (b.fig) return figure(slug, b.fig);
  if (b.video) return figure(slug, b.video);
  if (b.grid) return grid(slug, b.grid);
  if (b.compare) return compare(slug, b.compare);
  throw new Error(`unknown block ${JSON.stringify(b).slice(0, 60)}`);
}

function heroMedia(slug, h) {
  const parts = [];
  if (h.grid) parts.push(grid(slug, h.grid));
  if (h.fig) parts.push(figure(slug, h.fig, 'case-hero__media'));
  if (h.after) parts.push(block(slug, h.after));
  // The hero is the first thing on screen: load its images straight away.
  return parts
    .join('\n        ')
    .replace(/<img ([^>]*?)loading="lazy"/g, '<img $1loading="eager" fetchpriority="high"');
}

function page(slug) {
  const c = CASES[slug];
  const next = ORDER[(ORDER.indexOf(slug) + 1) % ORDER.length];
  const n = CASES[next];
  const nav = [
    ['work', 'Work'],
    ['films', 'Films'],
    ['experience', 'Experience'],
    ['about', 'About'],
  ];
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Generated by scripts/build-case-studies.mjs from content/case-studies/. Edit the content, not this file. -->
    <title>${esc(c.name)}: case study — Aayudh Vijay Ninawe</title>
    <meta name="description" content="${esc(c.description)}" />
    <meta name="theme-color" content="#FDF9ED" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${esc(c.title)}" />
    <meta property="og:description" content="${esc(c.description)}" />
    <meta property="og:image" content="/assets/work/${slug}-800.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="/favicon.ico" sizes="32x32" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="preload" href="/fonts/barlow-800.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/satoshi-400.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="stylesheet" href="/src/styles/main.css" />
  </head>
  <body>
    <svg width="0" height="0" style="position: absolute" aria-hidden="true" focusable="false">
      ${trident}
    </svg>

    <a class="skip-link" href="#main">Skip to content</a>

    <header class="site-header" data-theme="light">
      <div class="site-header__inner">
        <a class="site-header__home" href="/#top" aria-label="Aayudh Vijay Ninawe, home">
          <svg class="trident" aria-hidden="true"><use href="#i-trident" /></svg>
        </a>
        <nav class="nav" aria-label="Main">
          <ul class="nav__list">
${nav.map(([id, label]) => `            <li><a class="nav__link nav__link--${id}" href="/#${id}">${label}</a></li>`).join('\n')}
            <li>
              <a class="nav__link nav__link--contact" href="/#contact"
                >Contact<span class="nav__arrow" aria-hidden="true">↗</span></a
              >
            </li>
          </ul>
        </nav>
      </div>
    </header>

    <main id="main" class="case">
      <section class="case-hero section--light" data-theme="light" aria-labelledby="case-title">
        <div class="case-wide">
          <a class="case-back" href="/#work"><span aria-hidden="true">←</span> All work</a>
          <p class="case-kicker">${esc(c.kicker)}</p>
          <h1 id="case-title" class="case-title">${esc(c.title)}</h1>
          <p class="case-lead">${inline(c.lead)}</p>
        </div>
        ${heroMedia(slug, c.hero)}
        <dl class="case-facts case-wide">
${Object.entries(c.facts)
  .map(([k, v]) => `          <div>\n            <dt>${esc(k)}</dt>\n            <dd>${inline(v)}</dd>\n          </div>`)
  .join('\n')}
        </dl>
      </section>

      <section class="case-body section--light" data-theme="light" aria-label="Case study">
${c.sections
  .map(
    (s) => `        <section class="case-sec">
        <h2>${esc(s.title)}</h2>
        ${s.blocks.map((b) => block(slug, b)).join('\n        ')}
        </section>`
  )
  .join('\n\n')}
      </section>

      <section class="case-next section--dark" data-theme="dark" aria-label="Next project">
        <a class="case-next__link" href="/work/${next}/">
          <div>
            <p class="case-next__label">Next project</p>
            <p class="case-next__title display">${esc(n.name)} <span aria-hidden="true">→</span></p>
            <p class="case-next__line">${esc(n.line)}</p>
          </div>
          <div class="case-next__cover">
            <picture>
              <source type="image/avif" srcset="/assets/work/${next}-800.avif 800w, /assets/work/${next}-1200.avif 1200w" sizes="(max-width: 860px) 100vw, 620px" />
              <source type="image/webp" srcset="/assets/work/${next}-800.webp 800w, /assets/work/${next}-1200.webp 1200w" sizes="(max-width: 860px) 100vw, 620px" />
              <img src="/assets/work/${next}-800.jpg" alt="" width="1200" height="750" loading="lazy" decoding="async" />
            </picture>
          </div>
        </a>
      </section>
    </main>

    <footer class="site-footer section--dark" data-theme="dark">
      <div class="container site-footer__inner">
        <svg class="trident trident--footer" aria-hidden="true"><use href="#i-trident" /></svg>
        <p>Designed &amp; built by Aayudh</p>
        <a class="site-footer__top" href="#main">Back to top <span aria-hidden="true">↑</span></a>
      </div>
    </footer>

    <script type="module" src="/src/js/case.js"></script>
  </body>
</html>
`;
}

for (const slug of ORDER) {
  const dir = join(ROOT, 'work', slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), page(slug));
  console.log('wrote', `work/${slug}/index.html`);
}
