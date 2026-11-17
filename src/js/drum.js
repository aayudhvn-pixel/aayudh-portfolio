// 4.3 Work: the drum.
// Six panels (the three projects, twice) sit on a CSS 3D cylinder at 60°
// steps, so turning it loops forever with no jump. The front panel faces
// the viewer; its neighbours curve away. Turn it with the arrow buttons,
// drag / swipe, or ←/→ when the drum has focus. It never takes over page
// scroll (vertical swipes pass straight through).
//
// Click the front panel → its case study. Click a side panel → it turns
// to the front first.

import { gsap } from 'gsap';
import { prefersReducedMotion } from './util.js';

const STEP = 60; // degrees between panels (6 around the drum)
const COPIES = 2;

export function initDrum() {
  const drum = document.querySelector('.drum');
  if (!drum) return;
  const stage = drum.querySelector('.drum__stage');
  const ring = drum.querySelector('.drum__ring');
  const originals = [...ring.children];
  const count = originals.length; // 3 projects
  const status = drum.querySelector('.drum__status');
  const current = drum.querySelector('.drum__current');
  const reduce = prefersReducedMotion();

  // Second copy for the back half of the drum. Copies are hidden from
  // assistive tech and the tab order; the originals carry the semantics.
  for (let c = 1; c < COPIES; c++) {
    originals.forEach((li) => {
      const copy = li.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.dataset.copy = '1';
      ring.appendChild(copy);
    });
  }
  const panels = [...ring.children];
  const links = panels.map((li) => li.querySelector('a'));
  // Real lazy images in the copies would load twice; share the decoded ones.
  panels.forEach((li) => li.querySelectorAll('img').forEach((img) => (img.loading = 'eager')));

  drum.classList.add('is-ready');

  const s = { angle: 0 }; // ring rotation; panel i is in front when angle = -i * STEP
  let radius = 0;
  let front = -1;

  function measure() {
    const w = ring.offsetWidth;
    // Panels of width w meeting at 60° need r = (w/2)/tan(30°); a little
    // extra leaves a seam between them.
    radius = (w / 2 / Math.tan(Math.PI / 6)) * 1.06;
    panels.forEach((li, i) => {
      li.style.transform = `rotateY(${i * STEP}deg) translateZ(${radius}px)`;
    });
    render();
  }

  const wrap180 = (a) => ((((a + 180) % 360) + 360) % 360) - 180;

  function render() {
    ring.style.transform = `translateZ(${-radius}px) rotateY(${s.angle}deg)`;
    panels.forEach((li, i) => {
      const rel = Math.abs(wrap180(i * STEP + s.angle)); // 0 = facing us
      // Side panels fade a little as they curve away; back ones are hidden.
      li.style.opacity = rel >= 100 ? 0 : (0.45 + 0.55 * Math.cos((rel * Math.PI) / 180)).toFixed(3);
      li.style.visibility = rel >= 100 ? 'hidden' : 'visible';
    });
    const idx = ((Math.round(-s.angle / STEP) % panels.length) + panels.length) % panels.length;
    if (idx !== front) setFront(idx);
  }

  function setFront(idx) {
    front = idx;
    const project = idx % count;
    panels.forEach((li, i) => {
      const isFront = i === idx;
      li.classList.toggle('is-front', isFront);
      // Only the front panel is in the tab order; arrows/keys turn the drum.
      links[i].tabIndex = isFront && !li.dataset.copy ? 0 : -1;
      if (li.dataset.copy) links[i].tabIndex = -1;
    });
    // If a copy is in front, let the matching original take keyboard focus.
    if (panels[idx].dataset.copy) links[project].tabIndex = 0;
    current.textContent = String(project + 1);
    const name = originals[project].querySelector('.panel__name').textContent;
    status.textContent = `${name}, project ${project + 1} of ${count}`;
  }

  function turnTo(angle) {
    gsap.to(s, {
      angle,
      duration: reduce ? 0 : 0.85,
      ease: 'power3.inOut',
      overwrite: true,
      onUpdate: render,
    });
  }
  const snapped = () => Math.round(s.angle / STEP) * STEP;
  const go = (dir) => turnTo(snapped() - dir * STEP); // +1 = next (right panel comes to the front)

  // Turn so panel i is in front, the short way round.
  function bringToFront(i) {
    const delta = wrap180(i * STEP + snapped());
    turnTo(snapped() - delta);
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

  // Drag / swipe. Horizontal moves turn the drum; release snaps to the
  // nearest panel, and a quick flick moves at least one panel.
  let drag = null;
  let suppressUntil = 0;
  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, angle: s.angle, t: performance.now(), moved: false, id: e.pointerId };
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved) {
      if (Math.abs(dx) < 6) return;
      if (Math.abs(e.clientY - drag.y) > Math.abs(dx)) return (drag = null); // vertical: let the page scroll
      drag.moved = true;
      drum.classList.add('is-dragging');
      gsap.killTweensOf(s);
      try { stage.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
    }
    // One panel width of drag ≈ one 60° step.
    s.angle = drag.angle + (dx / ring.offsetWidth) * STEP;
    render();
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const { moved, angle, t, x } = drag;
    drag = null;
    drum.classList.remove('is-dragging');
    if (!moved) return;
    suppressUntil = performance.now() + 350; // the click that ends this drag
    const dx = e.clientX - x;
    const fast = Math.abs(dx) / Math.max(1, performance.now() - t) > 0.5; // px/ms
    let target = Math.round(s.angle / STEP) * STEP;
    if (fast && target === Math.round(angle / STEP) * STEP) target += Math.sign(dx) * STEP;
    turnTo(target);
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);

  // Clicks: ignore the click that ends a drag (a short time window, so a
  // drag that ends without a click can't swallow a later real click);
  // a side panel turns to the front.
  panels.forEach((li, i) => {
    links[i].addEventListener('click', (e) => {
      if (performance.now() < suppressUntil) {
        e.preventDefault();
        return;
      }
      if (i !== front) {
        e.preventDefault();
        bringToFront(i);
      }
    });
  });

  measure();
  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(measure, 120);
  });
}
