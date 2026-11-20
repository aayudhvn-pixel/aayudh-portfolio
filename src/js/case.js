// Case study pages and /films: header theme, plus videos that play only
// while on screen (muted loops). Under reduced motion they never autoplay;
// the poster shows and the controls are there.
import { inject } from '@vercel/analytics';
import { initNav } from './nav.js';
import { prefersReducedMotion } from './util.js';

// Vercel Web Analytics (cookieless page views), as on the home page.
inject();

initNav();

const videos = [...document.querySelectorAll('video[data-autoplay]')];
if (videos.length && !prefersReducedMotion() && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        if (isIntersecting) target.play().catch(() => {});
        else target.pause();
      }
    },
    { threshold: 0.35 }
  );
  videos.forEach((v) => io.observe(v));
}
