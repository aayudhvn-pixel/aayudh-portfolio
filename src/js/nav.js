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
}
