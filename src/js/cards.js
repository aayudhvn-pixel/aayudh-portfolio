// Hero cards: the resting ring around the hero text, hover tilt + holo
// shine, and the full-screen card viewer (drag to spin, click to flip).
// The pack opening (step 4) will animate cards into the ring rendered here.

import { gsap } from 'gsap';
import { prefersReducedMotion } from './util.js';

// Order = reveal order. pos: [x%, y%, tilt°] on desktop; phone: same on phones.
export const CARDS = [
  {
    id: 'designer',
    name: 'The Designer',
    alt: 'Card 001, The Designer. Psychic type, 100 HP. Attacks: Pixel Perfect, 30 damage; User First, 100 damage.',
    pos: [21, 26, -12],
    phone: [18, 15, -10],
  },
  {
    id: 'runner',
    name: 'The Runner',
    alt: "Card 002, The Runner. Fighting type, 365 HP. Attacks: Morning Mileage; Runner's High.",
    pos: [9, 61, 9],
    phone: [13, 84, 8],
  },
  {
    id: 'cook',
    name: 'The Cook',
    alt: 'Card 003, The Cook. Fire type, 150 HP. Attacks: Mise en Place, 20 damage; Chicken Curry, 120 damage, restores full HP to the whole family.',
    pos: [31, 88, -7],
    phone: [37, 91, -6],
  },
  {
    id: 'anime-lover',
    name: 'The Anime Lover',
    alt: 'Card 004, The Anime Lover. Dragon type, 180 HP. Attacks: Power-Up Arc, 50 damage; One More Episode, 90 damage.',
    pos: [69, 87, 6],
    phone: [63, 89, 5],
  },
  {
    id: 'artist',
    name: 'The Artist',
    alt: 'Card 005, The Artist. Dark type, 120 HP. Attacks: Ink Session, 40 damage; Sketch Daily, 80 damage.',
    pos: [91, 60, -9],
    phone: [87, 83, -9],
  },
  {
    id: 'samurai',
    name: 'The Samurai',
    rare: true,
    alt: 'Card 006, The Samurai, rare full-art card. Steel type. Attacks: Evergreen Fit; Classic With an Edge.',
    pos: [79, 25, 11],
    phone: [82, 15, 10],
  },
  {
    id: 'dojo',
    name: 'The Dojo',
    rare: true,
    alt: 'Card 007, The Dojo, rarest full-art card. Fighting type. Attacks: 100 Reps; Forged Daily.',
    pos: [50, 14, -3],
    phone: [50, 11, -3],
  },
];

const src = (id, w, ext = 'webp') => `/assets/cards/${id}-${w}.${ext}`;

// ------------------------------------------------------------------ ring

function renderRing(list) {
  list.innerHTML = CARDS.map(
    (c, i) => `
    <li class="ring-card${c.rare ? ' ring-card--rare' : ''}" data-index="${i}"
      style="--x:${c.pos[0]}%;--y:${c.pos[1]}%;--r:${c.pos[2]}deg;--px:${c.phone[0]}%;--py:${c.phone[1]}%;--pr:${c.phone[2]}deg">
      <button class="ring-card__btn" type="button" aria-haspopup="dialog">
        <span class="holo-card${c.rare ? ' holo-card--rare' : ''}">
          <span class="holo-card__face">
            <img src="${src(c.id, 500, 'png')}"
              srcset="${src(c.id, 500)} 500w, ${src(c.id, 1000)} 1000w"
              sizes="(max-width: 700px) 104px, 196px"
              width="500" height="700" alt="${c.alt.replace(/"/g, '&quot;')}" />
            <span class="holo-card__shine" aria-hidden="true"></span>
            <span class="holo-card__glare" aria-hidden="true"></span>
          </span>
        </span>
      </button>
    </li>`
  ).join('');
  return [...list.children];
}

// Push any card that touches the hero text outward until it is clear.
// Uses the real text line boxes, so it holds at every viewport size.
function clearHeroText(items, hero) {
  const GAP = 20;
  for (const li of items) li.style.setProperty('--dx', '0px'), li.style.setProperty('--dy', '0px');

  const lines = [...hero.querySelectorAll('.hero__title, .hero__lede')].flatMap((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    return [...range.getClientRects()];
  });
  if (!lines.length) return;
  const box = {
    left: Math.min(...lines.map((r) => r.left)) - GAP,
    right: Math.max(...lines.map((r) => r.right)) + GAP,
    top: Math.min(...lines.map((r) => r.top)) - GAP,
    bottom: Math.max(...lines.map((r) => r.bottom)) + GAP,
  };
  const cx = (box.left + box.right) / 2;
  const cy = (box.top + box.bottom) / 2;

  for (const li of items) {
    const r = li.getBoundingClientRect();
    const hit = r.right > box.left && r.left < box.right && r.bottom > box.top && r.top < box.bottom;
    if (!hit) continue;
    const ccx = (r.left + r.right) / 2;
    const ccy = (r.top + r.bottom) / 2;
    const dx = ccx < cx ? box.left - r.right : box.right - r.left;
    const dy = ccy < cy ? box.top - r.bottom : box.bottom - r.top;
    // Move along whichever axis needs the smaller push.
    if (Math.abs(dx) < Math.abs(dy)) li.style.setProperty('--dx', `${Math.round(dx)}px`);
    else li.style.setProperty('--dy', `${Math.round(dy)}px`);
  }
}

// ------------------------------------------------------------------ tilt + shine

// Pointer position over an element → CSS vars for the shine, plus a tilt.
function trackPointer(el, e) {
  const r = el.getBoundingClientRect();
  const mx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  const my = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
  el.style.setProperty('--mx', mx.toFixed(3));
  el.style.setProperty('--my', my.toFixed(3));
  return { mx, my };
}

function bindHover(li) {
  const btn = li.querySelector('.ring-card__btn');
  const card = li.querySelector('.holo-card');
  const reduce = prefersReducedMotion();
  const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.4, ease: 'power3.out' });
  const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.4, ease: 'power3.out' });

  btn.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const { mx, my } = trackPointer(card, e);
    card.classList.add('is-lit');
    if (!reduce) {
      rotY((mx - 0.5) * 24);
      rotX((0.5 - my) * 24);
    }
  });
  btn.addEventListener('pointerleave', () => {
    card.classList.remove('is-lit');
    rotX(0);
    rotY(0);
  });
}

// ------------------------------------------------------------------ viewer

function createViewer() {
  const dialog = document.querySelector('.card-viewer');
  if (!dialog) return null;
  const frame = dialog.querySelector('.card-viewer__frame');
  const card = dialog.querySelector('.viewer-card');
  const inner = dialog.querySelector('.holo-card__inner');
  const front = dialog.querySelector('.viewer-card__front');
  const title = dialog.querySelector('#card-viewer-title');
  const reduce = prefersReducedMotion();

  let current = null; // { li, data }
  let spin = 0; // resting Y rotation (multiples of 180)
  let drag = null;
  let closing = false;

  const toX = gsap.quickTo(inner, 'rotationX', { duration: 0.35, ease: 'power3.out' });
  const toY = gsap.quickTo(inner, 'rotationY', { duration: 0.35, ease: 'power3.out' });
  let tiltY = 0;

  function setFace() {
    const showingBack = Math.round(spin / 180) % 2 !== 0;
    card.classList.toggle('is-back', showingBack);
  }

  function flip(dir = 1) {
    spin += 180 * dir;
    setFace();
    gsap.to(inner, { rotationY: spin + tiltY, duration: reduce ? 0 : 0.7, ease: 'power3.inOut', overwrite: true });
  }

  // Rect of the ring card relative to where the viewer card sits, for the fly-in/out.
  function deltaFrom(li) {
    const from = li.querySelector('.holo-card').getBoundingClientRect();
    gsap.set(frame, { clearProps: 'transform' });
    const to = frame.getBoundingClientRect();
    return {
      x: from.left + from.width / 2 - (to.left + to.width / 2),
      y: from.top + from.height / 2 - (to.top + to.height / 2),
      scale: from.width / to.width,
      rotation: parseFloat(li.style.getPropertyValue('--r')) || 0,
    };
  }

  function open(li, data) {
    current = { li, data };
    spin = 0;
    tiltY = 0;
    gsap.set(inner, { rotationX: 0, rotationY: 0 });
    setFace();
    card.classList.toggle('holo-card--rare', !!data.rare);
    front.src = src(data.id, 1000);
    front.alt = data.alt;
    title.textContent = data.name;

    dialog.showModal();
    document.documentElement.classList.add('has-viewer');
    li.classList.add('is-open');

    if (reduce) return;
    const d = deltaFrom(li);
    gsap.fromTo(frame, { ...d }, { x: 0, y: 0, scale: 1, rotation: 0, duration: 0.6, ease: 'power3.out' });
    gsap.fromTo(dialog, { '--veil': 0 }, { '--veil': 1, duration: 0.4 });
  }

  function close() {
    if (!current || closing) return;
    closing = true;
    const { li } = current;
    const finish = () => {
      dialog.close();
      li.classList.remove('is-open');
      document.documentElement.classList.remove('has-viewer');
      gsap.set(frame, { clearProps: 'transform' });
      current = null;
      closing = false;
      li.querySelector('.ring-card__btn').focus({ preventScroll: true });
    };
    if (reduce) return finish();
    // Fly back to the ring; land on the front face.
    const d = deltaFrom(li);
    gsap.set(frame, { x: 0, y: 0, scale: 1, rotation: 0 });
    const tl = gsap.timeline({ onComplete: finish });
    tl.to(inner, { rotationX: 0, rotationY: Math.round(spin / 360) * 360, duration: 0.45, ease: 'power2.inOut' }, 0)
      .to(frame, { ...d, duration: 0.5, ease: 'power3.inOut' }, 0)
      .to(dialog, { '--veil': 0, duration: 0.4 }, 0.1);
  }

  // Tilt + shine follow the pointer while not dragging.
  dialog.addEventListener('pointermove', (e) => {
    if (drag) {
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) drag.moved = true;
      gsap.set(inner, { rotationY: drag.start + dx * 0.6 });
      return;
    }
    if (e.pointerType !== 'mouse' || reduce) return;
    const { mx, my } = trackPointer(card, e);
    card.classList.add('is-lit');
    tiltY = (mx - 0.5) * 30;
    toY(spin + tiltY);
    toX((0.5 - my) * 26);
  });

  card.addEventListener('pointerdown', (e) => {
    card.setPointerCapture(e.pointerId);
    drag = { x: e.clientX, start: gsap.getProperty(inner, 'rotationY'), moved: false };
    gsap.killTweensOf(inner, 'rotationY');
  });

  card.addEventListener('pointerup', (e) => {
    if (!drag) return;
    const { moved } = drag;
    drag = null;
    card.releasePointerCapture(e.pointerId);
    if (!moved) return flip(1);
    // Snap to the nearest face.
    const now = gsap.getProperty(inner, 'rotationY');
    spin = Math.round(now / 180) * 180;
    tiltY = 0;
    setFace();
    gsap.to(inner, { rotationY: spin, rotationX: 0, duration: reduce ? 0 : 0.6, ease: 'back.out(1.4)', overwrite: true });
  });

  card.addEventListener('pointercancel', () => (drag = null));

  // Click anywhere outside the card (the dark veil) closes.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.classList.contains('card-viewer__stage')) close();
  });
  dialog.querySelector('.card-viewer__close').addEventListener('click', close);
  dialog.querySelector('.card-viewer__flip').addEventListener('click', () => flip(1));

  // Esc: run our close animation instead of the instant native close.
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') flip(-1);
    if (e.key === 'ArrowRight') flip(1);
  });

  return { open };
}

// ------------------------------------------------------------------ init

export function initCards() {
  const list = document.querySelector('.card-ring');
  const hero = document.querySelector('.hero');
  if (!list || !hero) return;

  const items = renderRing(list);
  const viewer = createViewer();

  items.forEach((li) => {
    bindHover(li);
    const data = CARDS[Number(li.dataset.index)];
    li.querySelector('.ring-card__btn').addEventListener('click', () => viewer?.open(li, data));
  });

  const layout = () => clearHeroText(items, hero);
  layout();
  document.fonts?.ready.then(layout);
  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(layout, 120);
  });
}
