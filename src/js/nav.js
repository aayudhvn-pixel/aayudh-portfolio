// Top navigation.
// - Matches the header's theme (dark/light) to the section under it.
// - Marks the nav link for the section currently in view (aria-current).
// Hover flourishes are pure CSS (src/styles/nav.css).

export function initNav() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const themed = [...document.querySelectorAll('main > section[data-theme], .site-footer[data-theme]')];
  const links = new Map(
    [...header.querySelectorAll('.nav__link')].map((a) => [new URL(a.href).hash.slice(1), a])
  );

  let ticking = false;

  function update() {
    ticking = false;
    const probe = header.offsetHeight / 2; // the header's vertical middle
    const mid = window.innerHeight * 0.4; // "in view" line for the active link

    let theme = 'dark';
    let active = null;
    for (const el of themed) {
      const r = el.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) theme = el.dataset.theme;
      if (el.id && r.top <= mid && r.bottom > mid) active = el.id;
    }

    if (header.dataset.theme !== theme) header.dataset.theme = theme;
    for (const [id, a] of links) {
      if (id === active) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
  initMenu(header);
}

// Phones (≤640px, see nav.css): the nav sits behind a menu button and opens
// as a full-screen panel. Esc, the button or any link closes it; focus moves
// into the menu and back to the button; Tab stays inside while it's open.
function initMenu(header) {
  const toggle = header.querySelector('.nav-toggle');
  const nav = header.querySelector('.nav');
  if (!toggle || !nav) return;
  const phone = window.matchMedia('(max-width: 640px)');
  const links = [...nav.querySelectorAll('a')];
  let open = false;

  function set(next, { focus = true } = {}) {
    if (open === next) return;
    open = next;
    nav.classList.toggle('is-open', open);
    header.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (focus) (open ? links[0] : toggle).focus({ preventScroll: true });
  }

  toggle.addEventListener('click', () => set(!open));
  // A link closes the menu first, then the page goes where the link points.
  links.forEach((a) => a.addEventListener('click', () => set(false, { focus: false })));

  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') {
      set(false);
      return;
    }
    if (e.key === 'Tab') {
      const items = [toggle, ...links];
      const i = items.indexOf(document.activeElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i + 1) % items.length;
      e.preventDefault();
      items[next].focus();
    }
  });

  // Rotating to landscape or resizing past phone width: the menu just closes.
  phone.addEventListener('change', (e) => {
    if (!e.matches) set(false, { focus: false });
  });
}
