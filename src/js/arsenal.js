// 4.6 Arsenal (TRIAL): tools on wooden plaques hanging from cords.
// - Scroll-in: when a row comes into view (either direction), its plaques
//   sway into place, staggered, like they've just been hung.
// - Hover / keyboard focus / tap: a plaque swings on its cord (pivoting where
//   the cord meets the beam) and shows its one-line note. A tap keeps the
//   note open until you tap elsewhere.
// Reduced motion: no sway or swing; notes still show on hover/focus/tap.

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './util.js';

gsap.registerPlugin(ScrollTrigger);

export function initArsenal() {
  const section = document.querySelector('.arsenal');
  if (!section) return;
  const reduce = prefersReducedMotion();
  const plaques = [...section.querySelectorAll('.ema')];
  const rest = (li) => parseFloat(li.style.getPropertyValue('--rest')) || 0;

  // Swing one plaque: knocked to one side, then settles back with a few
  // decaying swings (elastic ease), around its cord point.
  function swing(li, dir = 1) {
    if (reduce) return;
    const btn = li.querySelector('.ema__plaque');
    gsap.fromTo(
      btn,
      { rotation: rest(li) + dir * 10 },
      { rotation: rest(li), duration: 1.6, ease: 'elastic.out(1, 0.28)', overwrite: true }
    );
  }

  plaques.forEach((li) => {
    const btn = li.querySelector('.ema__plaque');
    // Swing away from the side the pointer came in from.
    btn.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = btn.getBoundingClientRect();
      swing(li, e.clientX < r.left + r.width / 2 ? 1 : -1);
    });
    btn.addEventListener('focus', () => swing(li, 1));
    // Tap / click: toggle the note open (for touch, where there's no hover).
    btn.addEventListener('click', () => {
      const open = !li.classList.contains('is-active');
      plaques.forEach((p) => p.classList.remove('is-active'));
      li.classList.toggle('is-active', open);
      if (open) swing(li, Math.random() < 0.5 ? 1 : -1);
    });
  });

  // Tapping anywhere else closes an open note.
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.ema')) plaques.forEach((p) => p.classList.remove('is-active'));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') plaques.forEach((p) => p.classList.remove('is-active'));
  });

  if (reduce) return;

  // Sway in, row by row, whenever a row scrolls into view.
  section.querySelectorAll('.ema-row').forEach((row) => {
    const items = [...row.querySelectorAll('.ema')];
    const buttons = items.map((li) => li.querySelector('.ema__plaque'));
    const swayIn = () =>
      gsap.fromTo(
        buttons,
        { rotation: (i) => rest(items[i]) + (i % 2 ? 16 : -16) },
        {
          rotation: (i) => rest(items[i]),
          duration: 1.8,
          ease: 'elastic.out(1, 0.32)',
          stagger: 0.09,
          overwrite: true,
        }
      );
    ScrollTrigger.create({
      trigger: row,
      start: 'top 85%',
      end: 'bottom 15%',
      onEnter: swayIn,
      onEnterBack: swayIn,
    });
  });
}
