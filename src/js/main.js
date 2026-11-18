import { initNav } from './nav.js';
import { initPack } from './pack.js';
import { initCards } from './cards.js';
import { initDrum } from './drum.js';
import { initReel } from './reel.js';
import { initReveal } from './reveal.js';

// The first screen (pack, cards, hero) and what sits right below it start now.
initNav();
const ring = initCards(); // renders the hero cards in their resting ring
initPack(ring); // then the pack intro deals them into it
initDrum();
initReel();
initReveal(); // sections fade in as they scroll into view

// Sections far below the fold load once the browser is idle, so their code
// (and GSAP ScrollTrigger, which only they use) doesn't slow the first paint.
// Without JS, or until they load, these sections simply show their content.
const later = () =>
  Promise.all([import('./timeline.js'), import('./arsenal.js'), import('./stamps.js'), import('./contact.js')]).then(
    ([timeline, arsenal, stamps, contact]) => {
      timeline.initTimeline();
      arsenal.initArsenal();
      stamps.initStamps();
      contact.initContact();
    }
  );
if ('requestIdleCallback' in window) requestIdleCallback(later, { timeout: 1500 });
else setTimeout(later, 300);
