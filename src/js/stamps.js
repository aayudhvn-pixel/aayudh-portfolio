// 4.7 About: ink stamps that reveal facts (the section's signature interaction).
// Pick a stamp in the tray, then click / tap on the torn sheet to press it:
// red ink, a random tilt (±8°), a quick press (comes down, squashes, ink
// fades in). The trident gets a brief gold shimmer. Each stamp also reveals
// its own fact as a short jotted note beside the mark; a stamp type keeps
// one note at a time, so pressing it again moves its note to the new mark.
// "Clear" removes stamps and notes.
//
// Stamps are decoration (the layer is aria-hidden; the facts are also in a
// visually hidden list). Keyboard: Enter / Space on a tray stamp presses it
// at the next free spot in the stamp area. Esc puts the picked stamp down.

const MAX_STAMPS = 40; // oldest goes when the sheet gets crowded

export function initStamps() {
  const section = document.querySelector('.about');
  const sheet = section?.querySelector('.sheet');
  const layer = sheet?.querySelector('.stamp-layer');
  const tray = section?.querySelector('.stamp-tray');
  if (!section || !sheet || !layer || !tray) return;

  const area = sheet.querySelector('.sheet__stamps');
  const buttons = [...tray.querySelectorAll('.stamp-btn')];
  const clear = tray.querySelector('.stamp-tray__clear');
  const status = tray.querySelector('[data-stamp-status]');
  const button = (name) => buttons.find((b) => b.dataset.stamp === name);
  const notes = new Map(); // stamp name → its note element
  let picked = null;
  let nextSlot = 0;

  const updateClear = () => (clear.disabled = layer.childElementCount === 0);
  updateClear();

  function pick(name) {
    picked = picked === name ? null : name; // clicking the picked one puts it down
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.stamp === picked)));
    section.classList.toggle('is-stamping', !!picked);
    if (picked) section.style.setProperty('--stamp-cursor', `url(/assets/stamps/cursor-${picked}.png) 24 24`);
  }

  // The jotted fact beside a mark, kept inside the stamp area (so it never
  // lands on the photo or the facts): it opens toward whichever side of the
  // area has more room, and narrows to fit.
  function showNote(name, x, y, size, below = 0) {
    notes.get(name)?.remove();
    const text = button(name)?.dataset.fact;
    if (!text) return;
    const note = document.createElement('p');
    note.className = 'stamp-note';
    note.textContent = text;
    note.style.setProperty('--note-rot', `${(Math.random() * 4 - 2).toFixed(1)}deg`);
    const L = layer.getBoundingClientRect();
    const A = area.getBoundingClientRect();
    const areaLeft = A.left - L.left;
    const areaRight = A.right - L.left;
    const gap = size * 0.72 + 6; // clears the mark even at its full ±8° tilt
    if (below) {
      // Keyboard grid on a wide sheet: the note sits centred under its mark.
      note.classList.add('stamp-note--below');
      note.style.left = `${x}px`;
      note.style.top = `${y + gap - 4}px`;
      note.style.maxWidth = `${below}px`;
      layer.appendChild(note);
      notes.set(name, note);
      return;
    }
    const roomRight = areaRight - (x + gap) - 8;
    const roomLeft = x - gap - areaLeft - 8;
    if (roomLeft > roomRight) {
      note.classList.add('stamp-note--left');
      note.style.right = `${layer.clientWidth - x + gap}px`;
      note.style.maxWidth = `${Math.max(90, Math.min(190, roomLeft))}px`;
    } else {
      note.style.left = `${x + gap}px`;
      note.style.maxWidth = `${Math.max(90, Math.min(190, roomRight))}px`;
    }
    note.style.top = `${y}px`;
    layer.appendChild(note);
    notes.set(name, note);
  }

  // Press a stamp at (x, y) in sheet coordinates (the layer covers the sheet).
  function press(name, x, y, below = 0) {
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
    showNote(name, x, y, size, below);

    // Keep the sheet from overflowing: drop the oldest stamps (not notes).
    const all = [...layer.querySelectorAll('.stamp')];
    all.slice(0, Math.max(0, all.length - MAX_STAMPS)).forEach((s) => s.remove());
    updateClear();
  }

  // Keyboard: the next free spot inside the stamp area. On a wide, tall
  // area, a 3 × 2 grid with each note under its mark (all six stamps fit);
  // otherwise one column at the left with notes to the right, three rows.
  function slot() {
    const L = layer.getBoundingClientRect();
    const A = area.getBoundingClientRect();
    const size = window.innerWidth < 700 ? 64 : 84;
    const top = size / 2 + 34; // below the "Stamp here" hint
    const ox = A.left - L.left;
    const oy = A.top - L.top;
    if (A.width >= 400 && A.height >= 380) {
      const col = nextSlot % 3;
      const row = Math.floor(nextSlot / 3);
      nextSlot = (nextSlot + 1) % 6;
      return {
        x: ox + (A.width * (2 * col + 1)) / 6,
        y: oy + top + row * (size + 106),
        below: Math.min(150, A.width / 3 - 12),
      };
    }
    const row = nextSlot;
    nextSlot = (nextSlot + 1) % 3;
    // Rows are spaced by the stamp's size so tilted marks never touch.
    const step = Math.max(A.height * 0.28, size * 1.5);
    return { x: ox + A.width * 0.2, y: oy + Math.max(A.height * 0.22, top) + row * step, below: 0 };
  }

  // Tray: a mouse / touch click picks; a keyboard press (detail 0) stamps
  // straight away at the next free spot.
  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const name = btn.dataset.stamp;
      if (e.detail === 0) {
        const { x, y, below } = slot();
        press(name, x, y, below);
        status.textContent = `${btn.getAttribute('aria-label')} pressed: ${btn.dataset.fact}`;
        return;
      }
      pick(name);
    });
  });

  // Press wherever the sheet is clicked (not on its links or buttons).
  sheet.addEventListener('click', (e) => {
    if (!picked || e.target.closest('a, button')) return;
    const r = layer.getBoundingClientRect();
    press(picked, e.clientX - r.left, e.clientY - r.top);
  });

  clear.addEventListener('click', () => {
    layer.replaceChildren();
    notes.clear();
    nextSlot = 0;
    updateClear();
    status.textContent = 'Stamps cleared.';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && picked) pick(picked);
  });
}
