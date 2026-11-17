// Sections fade in as they come into view, on every pass, in both scroll
// directions: scrolling down, blocks rise in from below; scrolling back
// up, they drop in from above. A block resets only once it is fully off
// screen, so you never see it disappear, and the gap between the "in" and
// "out" lines stops it flickering at the edge.
//
// Includes the hero when you scroll back up to it: the heading and line
// drop in, and the card ring fades in (opacity only, because the pack
// intro and the push-clear-of-text layout measure the cards' positions).
// Whatever is already on screen at load appears at once, without
// animating, so this never fights the pack intro.
//
// Only content moves; section backgrounds stay put, so the dark run stays
// continuous. Off under reduced motion; without JS everything is visible.

import { prefersReducedMotion } from './util.js';

export function initReveal() {
  if (prefersReducedMotion()) return;

  const sectionBlocks = [...document.querySelectorAll('main > section:not(#top) > *, .site-footer > *')];
  const heroBlocks = [...document.querySelectorAll('#top .hero > *')];
  const ring = document.querySelector('#top .card-ring');

  const targets = [...heroBlocks, ...sectionBlocks].filter((el) => !el.matches('.visually-hidden, [aria-live]'));
  if (ring) {
    ring.classList.add('reveal--fade');
    targets.push(ring);
  }

  // Stagger children of the same parent slightly (entering only).
  targets.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => targets.includes(c));
    el.style.setProperty('--reveal-delay', `${Math.max(0, siblings.indexOf(el)) * 90}ms`);
    el.classList.add('reveal');
  });

  function check() {
    const vh = window.innerHeight;
    for (const el of targets) {
      const r = el.getBoundingClientRect();
      const shown = el.classList.contains('is-in');
      if (!shown && r.top < vh * 0.9 && r.bottom > vh * 0.1) {
        el.classList.add('is-in');
      } else if (r.top >= vh || r.bottom <= 0) {
        // Fully off screen (shown or jumped past): reset, ready to come in
        // from the side it is on.
        el.classList.remove('is-in');
        el.classList.toggle('from-above', r.bottom <= 0);
      }
    }
  }

  // First pass without transitions: what's on screen at load just shows.
  targets.forEach((el) => (el.style.transition = 'none'));
  check();
  void document.body.offsetHeight; // apply the no-transition state
  setTimeout(() => targets.forEach((el) => (el.style.transition = '')), 50);

  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check, { passive: true });
}
