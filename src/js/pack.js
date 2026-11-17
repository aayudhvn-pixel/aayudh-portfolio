// 4.1 Entry: the sealed booster pack.
// Tear it (drag across, click, Enter/Space, or just scroll) → the cards
// rise out face-down → the pack drops away → they fan into a hand and flip
// one by one (regulars, then Samurai, then Dojo) → they fly to their slots
// in the hero ring and the hero text fades in.
//
// Every load starts with the sealed pack. The <head> script sets html.intro
// before first paint; it is left off only for reduced motion or when
// arriving on a #link (e.g. /#work from a case study), which show the
// settled hero.

import { gsap } from 'gsap';
import { prefersReducedMotion } from './util.js';

export function initPack(ring) {
  const html = document.documentElement;
  if (!html.classList.contains('intro') || !ring?.items?.length) return;

  const entry = document.getElementById('top');
  const hero = entry.querySelector('.hero');
  const title = hero.querySelector('.hero__title');
  const flies = ring.items.map((li) => li.querySelector('.ring-card__fly'));
  const flips = ring.items.map((li) => li.querySelector('.ring-card__flip'));
  const holos = ring.items.map((li) => li.querySelector('.holo-card'));

  let tl = null;
  let done = false;
  let focusTitle = false; // Skip hands keyboard focus to the hero heading

  // Each card's resting centre and tilt in the ring (measured before we move it).
  function measureRest() {
    return flies.map((fly) => {
      const r = fly.getBoundingClientRect();
      return {
        cx: r.left + r.width / 2,
        cy: r.top + r.height / 2,
        w: fly.offsetWidth,
        h: fly.offsetHeight,
        rot: gsap.getProperty(fly, 'rotation') || 0,
      };
    });
  }

  function finish() {
    if (done) return;
    done = true;
    tl?.kill();
    gsap.set(flies, { clearProps: 'all' });
    gsap.set(flips, { clearProps: 'all' });
    gsap.set(holos, { scale: 1 });
    holos.forEach((h) => h.classList.remove('is-lit'));
    gsap.set(hero, { clearProps: 'all' });
    const hadFocusInStage = entry.querySelector('.pack-stage')?.contains(document.activeElement);
    html.classList.remove('intro', 'intro-playing', 'intro-lock');
    teardown();
    ring.layout();
    if (hadFocusInStage || focusTitle) title.focus({ preventScroll: true });
  }

  // Any in-page link (nav, "skip to content") ends the intro first.
  const onLink = (e) => {
    if (e.target.closest('a[href*="#"]')) finish();
  };
  document.addEventListener('click', onLink, true);

  const listeners = [];
  const on = (el, type, fn, opts) => {
    el.addEventListener(type, fn, opts);
    listeners.push(() => el.removeEventListener(type, fn, opts));
  };
  function teardown() {
    document.removeEventListener('click', onLink, true);
    listeners.forEach((off) => off());
  }

  // ---------------------------------------------------------- the pack
  const stage = entry.querySelector('.pack-stage');
  const wrap = stage.querySelector('.pack-wrap');
  const pack = stage.querySelector('.pack');
  const top = stage.querySelector('.pack__top');
  const body = stage.querySelector('.pack__body');
  const sheen = stage.querySelector('.pack__sheen');
  const hint = stage.querySelector('.pack-stage__hint');
  const who = stage.querySelector('.pack-stage__who');
  const skip = stage.querySelector('.pack-stage__skip');

  html.classList.add('intro-lock');
  window.scrollTo(0, 0);
  let sealed = true;
  let rest = [];
  let inside = []; // per card: transform that hides it inside the pack

  // Skip: available from the sealed pack until the cards have settled.
  // Not a hard cut: a ~1 s quick reveal — the pack fades away while every
  // card flips face-up and flies straight to its slot, and the hero text
  // fades in. Works from any point (sealed, or mid-reveal).
  let skipping = false;
  function skipQuick() {
    if (done || skipping) return;
    skipping = true;
    focusTitle = true; // the Skip button fades out, so focus moves to the heading
    sealed = false;
    tl?.kill();
    if (!rest.length || prefersReducedMotion()) return finish();
    gsap.killTweensOf([pack, sheen, top]);
    tl = gsap.timeline({ onComplete: finish });
    tl.to([hint, who, skip], { autoAlpha: 0, duration: 0.2 }, 0)
      .to(wrap, { scale: 0.88, autoAlpha: 0, duration: 0.35, ease: 'power2.in' }, 0)
      .set(flies, { autoAlpha: 1 }, 0.1)
      .to(flies, {
        x: 0,
        y: 0,
        rotation: (i) => rest[i].rot,
        scale: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.04,
      }, 0.1)
      .to(flips, { rotationY: 0, duration: 0.5, ease: 'power2.out', stagger: 0.04 }, 0.14)
      .fromTo(hero, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 0.4);
  }
  on(skip, 'click', skipQuick);

  // Park every card face-down inside the pack body (hidden behind it).
  function park() {
    gsap.set(flies, { clearProps: 'all' });
    ring.layout();
    rest = measureRest();
    const b = body.getBoundingClientRect();
    inside = rest.map((r) => {
      const scale = (b.width * 0.76) / r.w;
      return {
        x: b.left + b.width / 2 - r.cx,
        y: b.top + b.height * 0.07 + (r.h * scale) / 2 - r.cy,
        rotation: 0,
        scale,
      };
    });
    // Invisible while sealed: the pack tilts toward the cursor and flat cards
    // behind it would peek out at its edges.
    flies.forEach((fly, i) => gsap.set(fly, { ...inside[i], autoAlpha: 0 }));
    gsap.set(flips, { rotationY: 180 });
  }

  // Wait for fonts so the ring's push-clear-of-text is final before measuring.
  (document.fonts?.ready ?? Promise.resolve()).then(() => {
    if (done) return;
    park();
    html.classList.add('intro-playing');
  });
  on(window, 'resize', () => sealed && !done && park());

  // The pack turns to face the cursor anywhere on screen (like the card
  // viewer), and the foil sheen slides with its angle.
  const MAX_Y = 26;
  const MAX_X = 20;
  const tiltY = gsap.quickTo(pack, 'rotationY', { duration: 0.6, ease: 'power3.out' });
  const tiltX = gsap.quickTo(pack, 'rotationX', { duration: 0.6, ease: 'power3.out' });
  const sheenX = gsap.quickTo(sheen, '--mx', { duration: 0.6, ease: 'power3.out' });
  const sheenY = gsap.quickTo(sheen, '--my', { duration: 0.6, ease: 'power3.out' });
  const aim = (nx, ny) => {
    tiltY(nx * MAX_Y); // + turns the face right
    tiltX(-ny * MAX_X); // + turns the face up
    sheenX(0.5 + nx * 0.5);
    sheenY(0.5 + ny * 0.5);
  };
  if (!prefersReducedMotion()) {
    on(window, 'pointermove', (e) => {
      if (!sealed || e.pointerType !== 'mouse') return;
      const r = wrap.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
      aim(nx, ny);
    });
  }

  // Drag across the pack to peel the strip; past ~35% it tears.
  let drag = null;
  on(pack, 'pointerdown', (e) => {
    if (!sealed) return;
    try { pack.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
    drag = { x: e.clientX, moved: 0 };
  });
  on(pack, 'pointermove', (e) => {
    if (!drag || !sealed) return;
    const dx = e.clientX - drag.x;
    drag.moved = Math.max(drag.moved, Math.abs(dx));
    const p = Math.min(1, Math.abs(dx) / (wrap.offsetWidth * 0.9));
    const dir = Math.sign(dx) || 1;
    gsap.set(top, { x: dx * 0.35, y: -p * 16, rotation: -dir * p * 12 });
    gsap.set(hint, { autoAlpha: 1 - p * 2 });
    if (p > 0.35) {
      drag = null;
      tear(dir);
    }
  });
  const release = () => {
    if (!drag || !sealed) return;
    const { moved } = drag;
    drag = null;
    if (moved < 6) return tear(1); // a plain click opens it too
    gsap.to(top, { x: 0, y: 0, rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    gsap.to(hint, { autoAlpha: 1, duration: 0.3 });
  };
  on(pack, 'pointerup', release);
  on(pack, 'pointercancel', release);

  on(pack, 'keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      tear(1);
    }
  });

  // Scrolling (wheel, swipe, keys) opens it instead of scrolling away.
  on(window, 'wheel', (e) => {
    e.preventDefault();
    if (e.deltaY > 0) tear(1);
  }, { passive: false });
  let touchY = null;
  on(window, 'touchstart', (e) => (touchY = e.touches[0].clientY), { passive: true });
  on(window, 'touchmove', (e) => {
    if (e.target.closest('.pack')) return; // the pack handles its own drag
    if (touchY !== null && touchY - e.touches[0].clientY > 24) tear(1);
    e.preventDefault();
  }, { passive: false });
  on(window, 'keydown', (e) => {
    if (['ArrowDown', 'PageDown', 'End'].includes(e.key) || (e.key === ' ' && e.target === document.body)) {
      e.preventDefault();
      tear(1);
    }
  });

  // ---------------------------------------------------------- the reveal
  function tear(dir = 1) {
    if (!sealed || done) return;
    sealed = false;
    if (!rest.length) park();
    // Square the pack up to the viewer so the cards rise straight out of it.
    gsap.to(pack, { rotationX: 0, rotationY: 0, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
    gsap.to(sheen, { '--mx': 0.5, '--my': 0.5, duration: 0.25, overwrite: 'auto' });

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const box = entry.getBoundingClientRect();
    const header = parseFloat(getComputedStyle(html).getPropertyValue('--header-h')) || 64;
    const cx = box.left + box.width / 2;
    const cy = box.top + header + (Math.min(box.height, vh) - header) / 2;

    // A hand of cards, fanned around a pivot below the middle one.
    const fw = Math.min(150, vw / 5.4, vh * 0.2);
    const step = 9;
    const radius = fw * 1.4 * 2.3;
    const sag = radius * (1 - Math.cos((3 * step * Math.PI) / 180));
    const fan = rest.map((r, i) => {
      const a = (i - 3) * step;
      const rad = (a * Math.PI) / 180;
      return {
        x: cx + radius * Math.sin(rad) - r.cx,
        y: cy + radius * (1 - Math.cos(rad)) - sag / 2 - r.cy,
        rotation: a,
        scale: (fw * (ring.items[i].classList.contains('ring-card--rare') ? 1.06 : 1)) / r.w,
      };
    });

    const packW = wrap.offsetWidth;
    tl = gsap.timeline({ onComplete: finish });
    tl.set(flies, { autoAlpha: 1 }, 0.26); // pack is square again by now

    // 1. Rip: the strip flies off, the pack jolts.
    tl.to([hint, who], { autoAlpha: 0, duration: 0.25 }, 0)
      .to(top, {
        x: `+=${dir * packW * 1.1}`,
        y: -packW * 0.8,
        rotation: dir * 40,
        autoAlpha: 0,
        duration: 0.65,
        ease: 'power2.out',
      }, 0)
      .fromTo(body, { y: 0 }, { y: 8, duration: 0.09, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 0.02);

    // 2. Cards rise out of the pack, face-down.
    tl.to(flies, {
      y: (i) => inside[i].y - rest[i].h * inside[i].scale * 0.82,
      duration: 0.6,
      ease: 'power3.out',
      stagger: { each: 0.045, from: 'end' },
    }, 0.3);

    // 3. Pack drops away; the cards fan into a hand.
    tl.to(wrap, { y: vh * 0.75, rotation: 6, autoAlpha: 0, duration: 0.7, ease: 'power3.in' }, 0.95)
      .to(flies, {
        x: (i) => fan[i].x,
        y: (i) => fan[i].y,
        rotation: (i) => fan[i].rotation,
        scale: (i) => fan[i].scale,
        duration: 0.75,
        ease: 'power3.inOut',
        stagger: 0.03,
      }, 1.0);

    // 4. Flip one by one; the two rares get a holo flash.
    const FLIP_AT = 1.7;
    const GAP = 0.17;
    flips.forEach((flip, i) => {
      const t = FLIP_AT + i * GAP + (i >= 5 ? 0.12 * (i - 4) : 0); // rares get a beat of suspense
      tl.to(flip, { rotationY: 0, duration: 0.5, ease: 'back.out(1.7)' }, t);
      if (ring.items[i].classList.contains('ring-card--rare')) {
        tl.call(() => holos[i].classList.add('is-lit'), null, t + 0.2)
          .fromTo(holos[i], { scale: 1 }, { scale: 1.14, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' }, t + 0.2)
          .call(() => holos[i].classList.remove('is-lit'), null, t + 0.75);
      }
    });

    // 5. Settle into the hero ring; the hero text arrives.
    const SETTLE_AT = FLIP_AT + 6 * GAP + 0.36 + 0.55;
    tl.to(flies, {
      x: 0,
      y: 0,
      rotation: (i) => rest[i].rot,
      scale: 1,
      duration: 0.9,
      ease: 'power3.inOut',
      stagger: 0.045,
    }, SETTLE_AT)
      .fromTo(hero, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, SETTLE_AT + 0.45);
  }
}
