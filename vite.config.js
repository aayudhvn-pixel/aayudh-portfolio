import { defineConfig } from 'vite';
import { readdirSync, statSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';

const root = import.meta.dirname;
const IGNORE = new Set(['node_modules', 'dist', 'public', '.git', 'content', 'src']);

// Every .html file in the project becomes a page, so new routes
// (/work/memorease/, /films/ …) only need an index.html in their folder.
function findPages(dir, pages = {}) {
  for (const name of readdirSync(dir)) {
    if (IGNORE.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      findPages(full, pages);
    } else if (name.endsWith('.html')) {
      const key = relative(root, full).replace(/\\/g, '/').replace(/\.html$/, '');
      pages[key] = full;
    }
  }
  return pages;
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: findPages(resolve(root)),
    },
  },
});
