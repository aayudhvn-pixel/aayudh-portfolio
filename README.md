# Aayudh Vijay Ninawe — Portfolio

**Live: [aayudhninawe.com](https://aayudhninawe.com)**

Personal portfolio of Aayudh Vijay Ninawe: UI/UX designer, iOS developer, AI filmmaker and illustrator.

Hand-built with plain HTML, CSS and JavaScript (ES modules), bundled with [Vite](https://vite.dev) and animated with [GSAP](https://gsap.com). No framework. Hosted on Vercel.

> **© 2026 Aayudh Vijay Ninawe. All rights reserved.**
> This code is public so it can be read as part of my portfolio. It is **not** licensed for reuse: please don't copy, redistribute or republish it, in whole or in part, as your own site or project.
> The card art, illustrations, photos, screenshots, case-study text, films and the trident logo are my personal work and may not be used anywhere else.
> See [LICENSE](LICENSE) for details.

## Run locally

```bash
npm install
npm run dev
```

`npm run build` writes the production site to `dist/`.

## Structure

```
index.html                 Home page
work/<project>/index.html  Case study pages (generated, see below)
films/index.html           Films page
src/styles/                tokens.css (colours, type, space), fonts.css, base.css, one file per section
src/js/                    One module per feature: pack, cards, drum, reel, timeline, arsenal, stamps, contact, nav, main
public/                    Fonts, images, videos, resume, robots.txt, sitemap.xml
content/case-studies/      Case study text (case-studies.mjs) and image sizes (media.json)
scripts/                   Asset pipeline (images, reel, case-study media) and the case-study page generator
```

Any `index.html` placed in a folder is picked up as its own page by `vite.config.js`. Case study pages are generated from `content/case-studies/case-studies.mjs` with `node scripts/build-case-studies.mjs`.

## Third-party

These keep their own licenses and are not covered by the notice above:

- **Fonts:** Barlow and JetBrains Mono under the SIL Open Font License; Satoshi from [Fontshare](https://www.fontshare.com) under the Indian Type Foundry Free Font License.
- **GSAP** under its own [standard license](https://gsap.com/standard-license).
- **Tool logos** (Figma, Swift, HTML5, CSS, JavaScript, Krita) from [Simple Icons](https://simpleicons.org) (CC0). All tool and brand names and logos, including Canva, Spline, Higgsfield, Adobe and TEDx, belong to their respective owners and are shown only to name the tools I use and the work I did.
