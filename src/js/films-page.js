// /films: header theme, and only one film plays at a time.
import { initNav } from './nav.js';

initNav();

const videos = [...document.querySelectorAll('.film video')];
videos.forEach((v) =>
  v.addEventListener('play', () => videos.forEach((o) => o !== v && !o.paused && o.pause()))
);
