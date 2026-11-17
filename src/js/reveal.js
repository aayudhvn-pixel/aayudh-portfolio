// Sections fade and rise in as they come into view, on every pass, in both
// scroll directions: scrolling down, blocks rise in from below; scrolling
// back up, they drop in from above. A block fades back out only once it
// is fully off screen, so you never see it disappear, and the gap between
// the "in" and "out" lines stops it flickering at the edge.
//
// Only the content moves; section backgrounds stay put, so the dark
// hero → Work → Films run stays continuous. Off under reduced motion, and
// without JS everything is simply visible.

import { prefersReducedMotion } from './util.js';

export function initReveal() {
  if (prefersReducedMotion()) return;

  const targets = [...document.querySelectorAll('main > section:not(#top) > *, .site-footer > *')].filter(
    (el) => !el.matches('.visually-hidden, [aria-live]')
  );

  // Stagger children of the same section slightly (entering only).
  targets.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => targets.includes(c));
    el.style.setProperty('--reveal-delay', `${siblings.indexOf(el) * 90}ms`);
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

  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check, { passive: true });
  check(); // anything already on screen (e.g. arriving on /#work) shows at once
}
