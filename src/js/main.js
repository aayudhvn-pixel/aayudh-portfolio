import { initNav } from './nav.js';
import { initPack } from './pack.js';
import { initCards } from './cards.js';
import { initDrum } from './drum.js';
import { initReel } from './reel.js';
import { initStamps } from './stamps.js';
import { initReveal } from './reveal.js';
import { initTimeline } from './timeline.js';

initNav();
const ring = initCards(); // renders the hero cards in their resting ring
initPack(ring); // then the pack intro deals them into it
initDrum();
initReel();
initTimeline();
initStamps();
initReveal(); // sections fade in as they scroll into view
