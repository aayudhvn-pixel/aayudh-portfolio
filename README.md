# Aayudh Vijay Ninawe — Portfolio

Personal portfolio of Aayudh Vijay Ninawe: UI/UX designer, iOS developer, AI filmmaker and illustrator.

Hand-built with plain HTML, CSS and JavaScript (ES modules), bundled with [Vite](https://vite.dev) and animated with [GSAP](https://gsap.com). No framework.

## Run locally

```bash
npm install
npm run dev
```

`npm run build` writes the production site to `dist/`.

## Structure

```
index.html              Home page
src/styles/             tokens.css (colours, type, space), fonts.css, base.css, main.css
src/js/                 One module per feature: pack, cards, drum, reel, stamps, nav, main
public/fonts/           Self-hosted WOFF2 fonts
public/brand/           Trident logo
content/case-studies/   Case study text (Markdown)
```

Any `index.html` placed in a folder (for example `work/memorease/index.html`) is picked up as its own page by `vite.config.js`.

## Fonts

Barlow and JetBrains Mono are licensed under the SIL Open Font License. Satoshi is from [Fontshare](https://www.fontshare.com) under the Indian Type Foundry Free Font License.
