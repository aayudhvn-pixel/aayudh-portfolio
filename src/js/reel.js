// Films: the home teaser reel (step 7) and the small looping film tile in
// the hero line. Videos only play while on screen and never under
// reduced motion (they show their poster instead).

import { prefersReducedMotion } from './util.js';

function playWhileVisible(video) {
  if (prefersReducedMotion()) {
    video.pause();
    return;
  }
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) video.play().catch(() => {});
    else video.pause();
  });
  io.observe(video);
}

export function initReel() {
  const tile = document.querySelector('.tile--film video');
  if (tile) playWhileVisible(tile);
}
