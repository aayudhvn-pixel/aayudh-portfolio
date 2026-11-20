// /films: header theme, and only one film plays at a time.
import { inject } from '@vercel/analytics';
import { initNav } from './nav.js';

// Vercel Web Analytics (cookieless page views), as on the home page.
inject();
initNav();

const videos = [...document.querySelectorAll('.film video')];
videos.forEach((v) =>
  v.addEventListener('play', () => videos.forEach((o) => o !== v && !o.paused && o.pause()))
);
