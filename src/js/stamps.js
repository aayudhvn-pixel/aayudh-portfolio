// 4.7 About: ink stamps (the section's signature interaction).
// Pick a stamp in the tray, then click / tap anywhere on the desk (the to-do
// page, the photo, or the dark around them) to press it: red ink, a random
// tilt (±8°), a quick press (comes down, squashes, ink fades in). The trident
// gets a brief gold shimmer. "Clear" removes them all. Pure decoration: the
// layer is aria-hidden.
//
// Keyboard: Enter / Space on a tray stamp presses it at the next spot along
// the edges of the page and photo. Esc puts the picked stamp down.

const MAX_STAMPS = 40; // oldest goes when the desk gets crowded

// Keyboard spots, as fractions of an element's box (corners and edges, where
// a sticker would go).
const SPOTS = [
  ['.todo', 0.04, 0.02],
  ['.polaroid', 0.92, 0.06],
  ['.todo', 0.62, 0.0],
  ['.polaroid', 0.08, 0.95],
  ['.polaroid', 1.0, 0.62],
  ['.todo', 0.3, 1.0],
];

export function initStamps() {
  const section = document.querySelector('.about');
  const desk = section?.querySelector('.desk');
  const layer = desk?.querySelector('.stamp-layer');
  const tray = desk?.querySelector('.stamp-tray');
  if (!section || !desk || !layer || !tray) return;

  const buttons = [...tray.querySelectorAll('.stamp-btn')];
  const clear = tray.querySelector('.stamp-tray__clear');
  const status = tray.querySelector('[data-stamp-status]');
  let picked = null;
  let nextSpot = 0;

  const updateClear = () => (clear.disabled = layer.childElementCount === 0);
  updateClear();

  function pick(name) {
    picked = picked === name ? null : name; // clicking the picked one puts it down
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.stamp === picked)));
    section.classList.toggle('is-stamping', !!picked);
    if (picked) section.style.setProperty('--stamp-cursor', `url(/assets/stamps/cursor-${picked}.png) 24 24`);
  }

  // Press a stamp at (x, y) in desk coordinates.
  function press(name, x, y) {
    const stamp = document.createElement('div');
    stamp.className = 'stamp is-pressing';
    const size = window.innerWidth < 700 ? 64 : 84;
    stamp.style.setProperty('--stamp-size', `${size}px`);
    stamp.style.setProperty('--rot', `${(Math.random() * 16 - 8).toFixed(1)}deg`);
    stamp.style.left = `${x}px`;
    stamp.style.top = `${y}px`;
    const src = `/assets/stamps/${name}.webp`;
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    stamp.appendChild(img);
    if (name === 'trident') {
      const shine = document.createElement('span');
      shine.className = 'stamp__shine';
      shine.style.setProperty('--stamp-mask', `url(${src})`);
      stamp.appendChild(shine);
      setTimeout(() => shine.remove(), 1400);
    }
    layer.appendChild(stamp);
    stamp.addEventListener('animationend', () => stamp.classList.remove('is-pressing'), { once: true });

    const all = [...layer.children];
    all.slice(0, Math.max(0, all.length - MAX_STAMPS)).forEach((s) => s.remove());
    updateClear();
  }

  function spot() {
    const [sel, fx, fy] = SPOTS[nextSpot];
    nextSpot = (nextSpot + 1) % SPOTS.length;
    const D = layer.getBoundingClientRect();
    const R = desk.querySelector(sel).getBoundingClientRect();
    return { x: R.left - D.left + R.width * fx, y: R.top - D.top + R.height * fy };
  }

  // Tray: a mouse / touch click picks; a keyboard press (detail 0) stamps
  // straight away at the next spot.
  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (e.detail === 0) {
        const { x, y } = spot();
        press(btn.dataset.stamp, x, y);
        status.textContent = `${btn.getAttribute('aria-label')} pressed.`;
        return;
      }
      pick(btn.dataset.stamp);
    });
  });

  // Press wherever the desk is clicked (not in the tray). While a stamp is
  // picked, a click on a to-do line stamps it instead of ticking it.
  desk.addEventListener('click', (e) => {
    if (!picked || e.target.closest('.stamp-tray, a, button')) return;
    if (e.target.closest('label, input')) e.preventDefault();
    const r = layer.getBoundingClientRect();
    press(picked, e.clientX - r.left, e.clientY - r.top);
  });

  clear.addEventListener('click', () => {
    layer.replaceChildren();
    nextSpot = 0;
    updateClear();
    status.textContent = 'Stamps cleared.';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && picked) pick(picked);
  });
}
