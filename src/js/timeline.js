// 4.5 Experience: the scroll-drawn timeline.
// The red→gold line is scrubbed to normal page scroll with ScrollTrigger
// (never pinned, never scroll-jacked): it draws down as you scroll down and
// retracts as you scroll back up. Each entry turns on the moment the drawn
// line actually reaches its dot (dot fills red, text slides in); the
// trident at the end fills gold when the line completes.
// Reduced motion / no JS: everything is shown, line fully drawn.

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './util.js';

gsap.registerPlugin(ScrollTrigger);

export function initTimeline() {
  const timeline = document.querySelector('.timeline');
  if (!timeline || prefersReducedMotion()) return;

  const fill = timeline.querySelector('.timeline__fill');
  const items = [...timeline.querySelectorAll('.timeline__item')];
  const dots = items.map((li) => li.querySelector('.timeline__dot'));
  const end = timeline.querySelector('.timeline__end');
  const trident = end.querySelector('.timeline__trident');

  timeline.classList.add('is-animated');

  // Light up whatever the drawn line has reached.
  function sync() {
    const reach = fill.getBoundingClientRect().bottom;
    dots.forEach((dot, i) => {
      const r = dot.getBoundingClientRect();
      items[i].classList.toggle('is-on', r.top + r.height / 2 <= reach + 1);
    });
    const t = trident.getBoundingClientRect();
    end.classList.toggle('is-on', t.top + t.height / 2 <= reach + 1);
  }

  gsap.fromTo(
    fill,
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: 'none',
      // Check on every redraw of the line (the scrub smoothing means the
      // line trails the scroll position slightly).
      onUpdate: sync,
      scrollTrigger: {
        trigger: timeline,
        start: 'top 70%', // starts drawing as the timeline comes up the screen
        end: 'bottom 70%', // finishes as the trident reaches the same line
        scrub: 0.4,
        onRefresh: sync,
      },
    }
  );

  // Images and fonts above can shift the layout after load.
  window.addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
