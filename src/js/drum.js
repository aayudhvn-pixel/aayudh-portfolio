// 4.3 Work: the "bulge" row (replaces the drum, decided 2026-11-18).
// The projects sit in a row: the centre card is largest and faces the
// viewer, the neighbours get smaller and turn away with their outer edges
// receding. It loops: six panels (the three projects, twice) are laid out
// by their distance from the centre, and a panel that leaves one end
// re-enters at the other while invisible.
//
// Turn it with the arrows at the screen edges, drag / swipe, or ←/→ when
// it has focus. It never takes over page scroll. Click the centre card →
// its case study; click a side card → it slides to the centre first.

import { gsap } from 'gsap';
import { prefersReducedMotion } from './util.js';

const COPIES = 2;

export function initDrum() {
  const drum = document.querySelector('.drum');
  if (!drum) return;
  const stage = drum.querySelector('.drum__stage');
  const ring = drum.querySelector('.drum__ring');
  const originals = [...ring.children];
  const count = originals.length; // 3 projects
  const status = drum.querySelector('.drum__status');
  const reduce = prefersReducedMotion();

  // Copies fill the row and make the loop seamless. Hidden from assistive
  // tech and the tab order; the originals carry the semantics.
  for (let c = 1; c < COPIES; c++) {
    originals.forEach((li) => {
      const copy = li.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.dataset.copy = '1';
      ring.appendChild(copy);
    });
  }
  const panels = [...ring.children];
  const n = panels.length; // 6
  const links = panels.map((li) => li.querySelector('a'));
  panels.forEach((li) => li.querySelectorAll('img').forEach((img) => (img.loading = 'eager')));

  drum.classList.add('is-ready');

  // pos = which panel is centred (fractional while moving).
  const s = { pos: 0 };
  let front = -1;
  let w = 0;

  // Signed distance of panel i from the centre, wrapped to [-n/2, n/2).
  const relOf = (i) => {
    let r = (i - s.pos) % n;
    if (r < -n / 2) r += n;
    if (r >= n / 2) r -= n;
    return r;
  };

  function render() {
    panels.forEach((li, i) => {
      const r = relOf(i);
      const a = Math.abs(r);
      const sign = Math.sign(r);
      // Spacing tightens as cards get smaller further out.
      // Sized so turned, shrunken neighbours sit just clear of each other.
      const x = sign * (Math.min(a, 1) * 0.97 + Math.max(a - 1, 0) * 0.76) * w;
      const rot = sign * Math.min(a, 1.6) * 28; // outer edge recedes
      const scale = 1 - 0.13 * Math.min(a, 2.6);
      const z = -a * 90;
      // Visible out to two neighbours each side; fades out beyond that so
      // the wrap from one end to the other is never seen.
      const opacity = a <= 2 ? 1 : Math.max(0, 1 - (a - 2) * 2.2);
      li.style.transform = `translateX(${x.toFixed(1)}px) translateZ(${z.toFixed(1)}px) rotateY(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      li.style.opacity = opacity.toFixed(3);
      li.style.visibility = opacity <= 0.01 ? 'hidden' : 'visible';
      li.style.zIndex = String(100 - Math.round(a * 10));
      // Side cards dim a touch so the centre reads first.
      li.style.setProperty('--dim', Math.min(1, a * 0.45).toFixed(3));
    });
    const idx = ((Math.round(s.pos) % n) + n) % n;
    if (idx !== front) setFront(idx);
  }

  function setFront(idx) {
    front = idx;
    const project = idx % count;
    panels.forEach((li, i) => {
      li.classList.toggle('is-front', i === idx);
      links[i].tabIndex = -1;
    });
    // Keyboard focus always lands on the original of the centred project.
    links[project].tabIndex = 0;
    const name = originals[project].querySelector('.panel__name').textContent;
    status.textContent = `${name}, project ${project + 1} of ${count}`;
  }

  function moveTo(pos) {
    gsap.to(s, { pos, duration: reduce ? 0 : 0.7, ease: 'power3.inOut', overwrite: true, onUpdate: render });
  }
  const go = (dir) => moveTo(Math.round(s.pos) + dir); // +1 = next
  const bringToFront = (i) => moveTo(Math.round(s.pos) + Math.round(relOf(i)));

  function measure() {
    w = ring.offsetWidth;
    render();
  }

  // ---------------------------------------------------------- input
  drum.querySelector('.drum__btn--prev').addEventListener('click', () => go(-1));
  drum.querySelector('.drum__btn--next').addEventListener('click', () => go(1));

  drum.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    }
  });

  // Drag / swipe: horizontal moves slide the row; release snaps, and a
  // quick flick moves at least one card. Vertical swipes scroll the page.
  let drag = null;
  let suppressUntil = 0;
  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, pos: s.pos, t: performance.now(), moved: false, id: e.pointerId };
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved) {
      if (Math.abs(dx) < 6) return;
      if (Math.abs(e.clientY - drag.y) > Math.abs(dx)) return (drag = null);
      drag.moved = true;
      drum.classList.add('is-dragging');
      gsap.killTweensOf(s);
      try { stage.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
    }
    s.pos = drag.pos - dx / (w * 0.97); // drag left → next card comes in
    render();
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const { moved, pos, t, x } = drag;
    drag = null;
    drum.classList.remove('is-dragging');
    if (!moved) return;
    suppressUntil = performance.now() + 350; // the click that ends this drag
    const dx = e.clientX - x;
    const fast = Math.abs(dx) / Math.max(1, performance.now() - t) > 0.5;
    let target = Math.round(s.pos);
    if (fast && target === Math.round(pos)) target -= Math.sign(dx);
    moveTo(target);
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);

  panels.forEach((li, i) => {
    links[i].addEventListener('click', (e) => {
      if (performance.now() < suppressUntil) return e.preventDefault();
      if (i !== front) {
        e.preventDefault();
        bringToFront(i);
      }
    });
  });

  measure();
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(measure, 120);
  });
}
