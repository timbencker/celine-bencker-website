import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { chromium, type FullConfig } from '@playwright/test';

import { DIST_DIR, SITE_INDEX_PATH, loadSitemapRoutes, toLocalUrl } from './site';
import { type SiteIndex, inspectTarget } from './site-index';

/**
 * Runs once per run, after the webServer is up and before any test.
 *
 * Builds the site index: every sitemap page, and every internal link target
 * those pages contain, requested exactly once. The tests then check links,
 * fragments and hreflang reciprocity against this index instead of
 * re-requesting the same targets at every viewport in every worker.
 *
 * Returns the teardown, which removes the run's freshness stamp from `dist/`.
 */
export default async function globalSetup(config: FullConfig) {
  const use = config.projects[0]?.use ?? {};
  const routes = loadSitemapRoutes();

  const browser = await chromium.launch({ channel: use.channel ?? 'chrome', headless: true });
  const index: SiteIndex = {};

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    const queue = routes.map((route) => route.url);
    const seen = new Set(queue);

    for (let i = 0; i < queue.length; i++) {
      const url = queue[i];
      index[url] = await inspectTarget(context.request, page, url);

      // Follow links out of sitemap pages only; other targets are just inspected.
      if (i >= routes.length || index[url].status !== 200) continue;

      const hrefs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('a[href], area[href], link[href]'), (el) =>
          el instanceof HTMLAnchorElement ||
          el instanceof HTMLAreaElement ||
          el instanceof HTMLLinkElement
            ? el.href
            : '',
        ),
      );
      for (const href of hrefs) {
        const target = toLocalUrl(href);
        if (target && !seen.has(target)) {
          seen.add(target);
          queue.push(target);
        }
      }
    }
  } finally {
    await browser.close();
  }

  mkdirSync(dirname(SITE_INDEX_PATH), { recursive: true });
  writeFileSync(SITE_INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`);

  return async () => {
    rmSync(`${DIST_DIR}_e2e`, { recursive: true, force: true });
  };
}
