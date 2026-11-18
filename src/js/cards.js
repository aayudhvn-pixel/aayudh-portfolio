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
    pos: [9, 61, 9],
    phone: [13, 84, 8],
  },
  {
    id: 'runner',
    name: 'The Runner',
    alt: "Card 002, The Runner. Fighting type, 365 HP. Attacks: Morning Mileage; Runner's High.",
    pos: [50, 14, -3],
    phone: [50, 11, -3],
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
    pos: [21, 26, -12],
    phone: [18, 15, -10],
  },
];

const src = (id, w, ext = 'webp') => `/assets/cards/${id}-${w}.${ext}`;

// ------------------------------------------------------------------ ring

function renderRing(list) {
  list.innerHTML = CARDS.map(
    (c, i) => `
    <li class="ring-card${c.rare ? ' ring-card--rare' : ''}" data-index="${i}"
      style="--x:${c.pos[0]}%;--y:${c.pos[1]}%;--r:${c.pos[2]}deg;--px:${c.phone[0]}%;--py:${c.phone[1]}%;--pr:${c.phone[2]}deg">
      <div class="ring-card__fly">
        <button class="ring-card__btn" type="button" aria-haspopup="dialog">
          <span class="holo-card${c.rare ? ' holo-card--rare' : ''}">
            <span class="ring-card__flip">
              <span class="holo-card__face">
                <img src="${src(c.id, 500, 'png')}"
                  srcset="${src(c.id, 250)} 250w, ${src(c.id, 500)} 500w, ${src(c.id, 1000)} 1000w"
                  sizes="(max-width: 700px) 104px, 196px"
                  width="500" height="700" alt="${c.alt.replace(/"/g, '&quot;')}" />
                <span class="holo-card__shine" aria-hidden="true"></span>
                <span class="holo-card__glare" aria-hidden="true"></span>
              </span>
              <span class="holo-card__face holo-card__face--back" aria-hidden="true">
                <img src="${src('back', 500)}" srcset="${src('back', 250)} 250w, ${src('back', 500)} 500w"
                  sizes="(max-width: 700px) 104px, 196px" width="500" height="700" alt="" />
              </span>
            </span>
          </span>
        </button>
      </div>
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
    const r = li.querySelector('.ring-card__fly').getBoundingClientRect();
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

  // One loop owns the card's rotation, so look-at, flip and drag never
  // fight each other.
  //   spin  — Y rotation from flips/drag (rests on multiples of 180)
  //   pitch — extra X rotation while dragging (springs back to 0)
  //   rx/ry — the "look at the cursor" tilt, eased toward tx/ty
  const MAX_Y = 38; // degrees the card turns left/right toward the cursor
  const MAX_X = 30; // degrees it turns up/down
  const s = { spin: 0, pitch: 0, rx: 0, ry: 0, tx: 0, ty: 0, fx: 0.45, tfx: 0.45, mx: 0.5, my: 0.5, tmx: 0.5, tmy: 0.5 };
  let running = false;
  let current = null; // { li, data }
  let drag = null;
  let closing = false;
  let back = false;

  function frameLoop() {
    const k = 0.14; // easing per frame
    s.rx += (s.tx - s.rx) * k;
    s.ry += (s.ty - s.ry) * k;
    s.fx += (s.tfx - s.fx) * k;
    s.mx += (s.tmx - s.mx) * k;
    s.my += (s.tmy - s.my) * k;

    const y = s.spin + s.ry;
    const x = s.pitch + s.rx;
    inner.style.transform = `rotateX(${x.toFixed(2)}deg) rotateY(${y.toFixed(2)}deg)`;

    // Which face points at the viewer?
    const isBack = Math.cos((y * Math.PI) / 180) * Math.cos((x * Math.PI) / 180) < 0;
    if (isBack !== back) card.classList.toggle('is-back', (back = isBack));

    card.style.setProperty('--mx', s.mx.toFixed(3));
    card.style.setProperty('--my', s.my.toFixed(3));
    card.style.setProperty('--fx', s.fx.toFixed(3));
  }
  // Driven by GSAP's ticker so it stays in sync with the flip/fly tweens.
  const start = () => !running && (gsap.ticker.add(frameLoop), (running = true));
  const stop = () => (gsap.ticker.remove(frameLoop), (running = false));

  // Aim the card at the pointer. The pointer is measured against the
  // whole screen, so the card follows it anywhere, not only over the card.
  function lookAt(clientX, clientY) {
    const r = frame.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const nx = Math.max(-1, Math.min(1, (clientX - cx) / (window.innerWidth / 2)));
    const ny = Math.max(-1, Math.min(1, (clientY - cy) / (window.innerHeight / 2)));
    // rotateY turns the *front* toward +x; with the back showing the same
    // rotation turns the back away, so the sign flips (fixes the back face
    // looking away from the cursor). rotateX is screen-space: same for both.
    s.ty = nx * MAX_Y * restFacing(); // turns the visible face toward the cursor
    s.tx = -ny * MAX_X; // + turns the face upward
    // Light: the sheen sweeps across as the card turns, and the foil
    // catches more light the further it is angled.
    s.tmx = 0.5 + nx * 0.5;
    s.tmy = 0.5 + ny * 0.5;
    s.tfx = 0.35 + 0.65 * Math.min(1, Math.hypot(nx, ny));
  }

  // +1 when the front faces the viewer, -1 for the back.
  const facingOf = (spin, pitch) =>
    Math.cos((spin * Math.PI) / 180) * Math.cos((pitch * Math.PI) / 180) >= 0 ? 1 : -1;
  // Facing at the spin the card is resting on (or heading to).
  let restSpin = 0;
  const restFacing = () => facingOf(restSpin, 0);

  function flip(dir = 1) {
    restSpin = Math.round(s.spin / 180) * 180 + 180 * dir;
    gsap.to(s, { spin: restSpin, pitch: 0, duration: reduce ? 0 : 0.75, ease: 'power3.inOut', overwrite: true });
  }

  // After a free drag: settle upright on whichever face is toward the viewer.
  function settle() {
    const showBack = facingOf(s.spin, s.pitch) < 0;
    restSpin = showBack ? Math.round((s.spin - 180) / 360) * 360 + 180 : Math.round(s.spin / 360) * 360;
    gsap.to(s, { spin: restSpin, pitch: 0, duration: reduce ? 0 : 0.7, ease: 'back.out(1.2)', overwrite: true });
  }

  // Ring card position relative to the viewer card, for the fly-in/out.
  function deltaFrom(li) {
    const from = li.querySelector('.holo-card').getBoundingClientRect();
    gsap.set(frame, { clearProps: 'transform' });
    const to = frame.getBoundingClientRect();
    return {
      x: from.left + from.width / 2 - (to.left + to.width / 2),
      y: from.top + from.height / 2 - (to.top + to.height / 2),
      scale: from.width / to.width,
      rotation: gsap.getProperty(li.querySelector('.ring-card__fly'), 'rotation') || 0,
    };
  }

  function open(li, data) {
    current = { li, data };
    Object.assign(s, { spin: 0, pitch: 0, rx: 0, ry: 0, tx: 0, ty: 0, fx: 0.45, tfx: 0.45, mx: 0.5, my: 0.5, tmx: 0.5, tmy: 0.5 });
    back = false;
    restSpin = 0;
    card.classList.remove('is-back');
    card.classList.toggle('holo-card--rare', !!data.rare);
    front.src = src(data.id, 1000);
    front.alt = data.alt;
    title.textContent = data.name;

    dialog.showModal();
    document.documentElement.classList.add('has-viewer');
    li.classList.add('is-open');
    start();

    if (reduce) return;
    const d = deltaFrom(li);
    gsap.fromTo(frame, { ...d }, { x: 0, y: 0, scale: 1, rotation: 0, duration: 0.6, ease: 'power3.out' });
    gsap.fromTo(dialog, { '--veil': 0 }, { '--veil': 1, duration: 0.4 });
  }

  function close() {
    if (!current || closing) return;
    closing = true;
    drag = null;
    const { li } = current;
    const finish = () => {
      stop();
      dialog.close();
      li.classList.remove('is-open');
      document.documentElement.classList.remove('has-viewer');
      gsap.set(frame, { clearProps: 'transform' });
      inner.style.transform = '';
      current = null;
      closing = false;
      li.querySelector('.ring-card__btn').focus({ preventScroll: true });
    };
    if (reduce) return finish();
    // Settle face-up, then fly back to the ring slot.
    Object.assign(s, { tx: 0, ty: 0, tfx: 0 });
    const d = deltaFrom(li);
    gsap.set(frame, { x: 0, y: 0, scale: 1, rotation: 0 });
    gsap
      .timeline({ onComplete: finish })
      .to(s, { spin: Math.round(s.spin / 360) * 360, pitch: 0, duration: 0.45, ease: 'power2.inOut', overwrite: true }, 0)
      .to(frame, { ...d, duration: 0.5, ease: 'power3.inOut' }, 0)
      .to(dialog, { '--veil': 0, duration: 0.4 }, 0.1);
  }

  // Pointer anywhere on screen: look at it (or drag-rotate while held).
  dialog.addEventListener('pointermove', (e) => {
    if (closing) return;
    if (drag) {
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (Math.hypot(dx, dy) > 5) drag.moved = true;
      // Free rotation in any direction. Horizontal drag is mirrored when the
      // back is showing so the card always moves the way you pull it.
      s.spin = drag.spin + dx * 0.5 * drag.sign;
      s.pitch = drag.pitch - dy * 0.45;
      s.tmx = 0.5 + Math.max(-1, Math.min(1, dx / 300)) * 0.5;
      s.tmy = 0.5 + Math.max(-1, Math.min(1, dy / 300)) * 0.5;
      s.tfx = 0.9;
      return;
    }
    if (e.pointerType === 'mouse' && !reduce) lookAt(e.clientX, e.clientY);
  });

  // Drag the card to turn it in any direction; release snaps to a face.
  card.addEventListener('pointerdown', (e) => {
    try { card.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
    gsap.killTweensOf(s);
    drag = { x: e.clientX, y: e.clientY, spin: s.spin, pitch: s.pitch, sign: facingOf(s.spin, s.pitch), moved: false };
    Object.assign(s, { tx: 0, ty: 0 }); // hand control to the drag
  });

  card.addEventListener('pointerup', (e) => {
    if (!drag) return;
    const { moved } = drag;
    drag = null;
    if (card.hasPointerCapture(e.pointerId)) card.releasePointerCapture(e.pointerId);
    if (!moved) return flip(1);
    settle();
    if (e.pointerType === 'mouse') lookAt(e.clientX, e.clientY);
    else Object.assign(s, { tfx: 0.45, tmx: 0.5, tmy: 0.5 });
  });

  card.addEventListener('pointercancel', () => {
    drag = null;
    settle();
  });

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

  // Skipped while the pack intro is flying the cards around (their
  // boxes aren't at rest); pack.js calls layout() again when it settles.
  const layout = () => {
    if (document.documentElement.classList.contains('intro-playing')) return;
    clearHeroText(items, hero);
  };
  layout();
  document.fonts?.ready.then(layout);
  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(layout, 120);
  });

  return { items, layout };
}
