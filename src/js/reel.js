// 4.4 Films: the teaser reel (the Films section's backdrop), the small
// looping film tile in the hero line, and the "/films" folder.
//
// Videos load only when near the viewport, play only while on screen and
// never under reduced motion (they show their poster instead). Visibility
// uses a plain passive scroll check, same as reveal.js.
//
// The folder opens like iOS: it grows into a big glass panel, the screen
// dims, "/films" appears above it, then the films page loads.

import { gsap } from 'gsap';
import { prefersReducedMotion } from './util.js';

// Call onChange(state) when an element is 'near' (within one screen),
// 'visible', or 'away'. Fires only when the state changes.
function watch(el, onChange) {
  let state = null;
  const check = () => {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const next = r.bottom > 0 && r.top < vh ? 'visible' : r.bottom > -vh && r.top < vh * 2 ? 'near' : 'away';
    if (next !== state) onChange((state = next));
  };
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check, { passive: true });
  check();
}

// Swap data-src / data-poster in when the video gets close.
function load(video) {
  if (video.dataset.loaded) return;
  video.dataset.loaded = '1';
  if (video.dataset.poster) video.poster = video.dataset.poster;
  video.querySelectorAll('source[data-src]').forEach((s) => (s.src = s.dataset.src));
  video.load();
}

function autoVideo(video, { lazy = false } = {}) {
  const reduce = prefersReducedMotion();
  if (reduce) {
    video.removeAttribute('autoplay');
    video.pause();
  }
  watch(video, (state) => {
    if (state !== 'away' && lazy) load(video);
    if (reduce) return;
    if (state === 'visible') video.play().catch(() => {});
    else video.pause();
  });
}

// ---------------------------------------------------------- folder
function initFolder() {
  const folder = document.querySelector('.folder');
  if (!folder) return;
  const icon = folder.querySelector('.folder__icon');

  folder.addEventListener('click', (e) => {
    // New tab / window: let the browser handle it.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (prefersReducedMotion()) return;
    e.preventDefault();
    const href = folder.href;

    // Build the open state: dimmed screen, title, big glass panel of apps.
    const overlay = document.createElement('div');
    overlay.className = 'folder-open';
    overlay.setAttribute('aria-hidden', 'true');
    const title = document.createElement('p');
    title.className = 'folder-open__title';
    title.textContent = '/films';
    const panel = document.createElement('div');
    panel.className = 'folder-open__panel';
    icon.querySelectorAll('img').forEach((img) => {
      const app = img.cloneNode();
      app.className = 'folder-open__app';
      app.loading = 'eager';
      panel.appendChild(app);
    });
    overlay.append(title, panel);
    document.body.appendChild(overlay);

    // Grow the panel out of the folder icon (uniform scale: both are squares).
    const from = icon.getBoundingClientRect();
    const to = panel.getBoundingClientRect();
    icon.style.visibility = 'hidden';

    gsap
      .timeline({ onComplete: () => window.location.assign(href) })
      .fromTo(overlay, { backgroundColor: 'rgba(18, 6, 3, 0)' }, { backgroundColor: 'rgba(18, 6, 3, 0.85)', duration: 0.4 }, 0)
      .fromTo(
        panel,
        {
          x: from.left + from.width / 2 - (to.left + to.width / 2),
          y: from.top + from.height / 2 - (to.top + to.height / 2),
          scale: from.width / to.width,
        },
        { x: 0, y: 0, scale: 1, duration: 0.55, ease: 'power3.out' },
        0
      )
      .fromTo(title, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 0.25)
      .to({}, { duration: 0.25 }); // a beat on the open folder before the page changes

    // Coming back with the browser's Back button (page restored from cache):
    // put everything back as it was.
    window.addEventListener(
      'pageshow',
      (ev) => {
        if (!ev.persisted) return;
        overlay.remove();
        icon.style.visibility = '';
      },
      { once: true }
    );
  });
}

export function initReel() {
  const tile = document.querySelector('.tile--film video');
  if (tile) autoVideo(tile);
  const reel = document.querySelector('.films__reel');
  if (reel) autoVideo(reel, { lazy: true });
  initFolder();
}
