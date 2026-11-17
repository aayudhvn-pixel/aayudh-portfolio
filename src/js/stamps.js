// 4.5 About: ink stamps (the section's signature interaction).
// Pick a stamp in the tray, then click / tap anywhere in About to press it:
// red ink, a random tilt (±8°), a quick press (comes down, squashes, ink
// fades in). The trident gets a brief gold shimmer. "Clear" removes them.
//
// Stamps are decoration (the layer is aria-hidden) and sit behind the
// text, so they never cover the content. Keyboard: Enter / Space on a
// tray stamp presses it near the centre of the section. Esc puts the
// picked stamp down.

const MAX_STAMPS = 40; // oldest goes when the page gets crowded

export function initStamps() {
  const section = document.querySelector('.about');
  const layer = section?.querySelector('.stamp-layer');
  const tray = section?.querySelector('.stamp-tray');
  if (!section || !layer || !tray) return;

  const buttons = [...tray.querySelectorAll('.stamp-btn')];
  const clear = tray.querySelector('.stamp-tray__clear');
  const status = tray.querySelector('[data-stamp-status]');
  const label = (name) => buttons.find((b) => b.dataset.stamp === name)?.getAttribute('aria-label') ?? name;
  let picked = null;

  const updateClear = () => (clear.disabled = layer.childElementCount === 0);
  updateClear();

  function pick(name) {
    picked = picked === name ? null : name; // clicking the picked one puts it down
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.stamp === picked)));
    section.classList.toggle('is-stamping', !!picked);
    if (picked) section.style.setProperty('--stamp-cursor', `url(/assets/stamps/cursor-${picked}.png) 24 24`);
  }

  // Press a stamp at (x, y) in section coordinates.
  function press(name, x, y) {
    const stamp = document.createElement('div');
    stamp.className = 'stamp is-pressing';
    const size = window.innerWidth < 700 ? 84 : 112;
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
    while (layer.childElementCount > MAX_STAMPS) layer.firstElementChild.remove();
    updateClear();
  }

  // Tray: a mouse / touch click picks; a keyboard press (detail 0) stamps
  // straight away near the centre, as the brief asks.
  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const name = btn.dataset.stamp;
      if (e.detail === 0) {
        const jitter = () => (Math.random() - 0.5) * 120;
        press(name, section.clientWidth / 2 + jitter(), section.clientHeight / 2 + jitter());
        status.textContent = `${label(name)} pressed.`;
        return;
      }
      pick(name);
    });
  });

  // Press wherever the section is clicked (not on links, buttons or the tray).
  section.addEventListener('click', (e) => {
    if (!picked || e.target.closest('a, button, .stamp-tray')) return;
    const r = section.getBoundingClientRect();
    press(picked, e.clientX - r.left, e.clientY - r.top);
  });

  clear.addEventListener('click', () => {
    layer.replaceChildren();
    updateClear();
    status.textContent = 'Stamps cleared.';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && picked) pick(picked);
  });
}
