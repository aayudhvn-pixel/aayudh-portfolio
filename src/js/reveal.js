// Sections fade and rise in as they are about to enter the viewport.
// Only the content moves; section backgrounds stay put, so the dark
// hero → Work → Films run stays continuous. Each element animates once.
// Skipped for reduced motion, and without JS everything is simply visible.
//
// A plain passive scroll check (there are only a handful of blocks, and
// the listener removes itself once all have appeared) — no dependence on
// IntersectionObserver timing.

import { prefersReducedMotion } from './util.js';

export function initReveal() {
  if (prefersReducedMotion()) return;

  let pending = [...document.querySelectorAll('main > section:not(#top) > *, .site-footer > *')].filter(
    (el) => !el.matches('.visually-hidden, [aria-live]')
  );

  // Stagger children of the same section slightly.
  pending.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => pending.includes(c));
    el.style.setProperty('--reveal-delay', `${siblings.indexOf(el) * 90}ms`);
    el.classList.add('reveal');
  });

  function check() {
    // Reveal a little before the block's top reaches the bottom of the screen.
    const line = window.innerHeight * 0.92;
    pending = pending.filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < line && r.bottom > 0) {
        el.classList.add('is-in');
        return false;
      }
      return true;
    });
    if (!pending.length) {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    }
  }

  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check, { passive: true });
  check(); // anything already on screen (e.g. arriving on /#work) shows at once
}
