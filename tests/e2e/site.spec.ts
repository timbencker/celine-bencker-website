import { type Page, expect, test } from '@playwright/test';

import { DEFAULT_LOCALE, LOCALE_HTML_LANG } from '../../src/i18n/config';
import { formatViolations, runAxe } from './support/axe';
import { collectPageErrors } from './support/errors';
import {
  type Alternate,
  BASE_PATH,
  BASE_URL,
  PRODUCTION_BASE_URL,
  type Route,
  loadSitemapRoutes,
  routePathOf,
  toLocalUrl,
} from './support/site';
import { resolveTarget } from './support/site-index';

/**
 * Every page in the built sitemap, at phone, tablet and desktop width.
 * Test titles start with the page path, so `--grep "/de/forschung/"` runs one
 * page. What each check guarantees: tests/README.md.
 */

const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
];

const GERMAN = LOCALE_HTML_LANG[DEFAULT_LOCALE];

async function open(page: Page, route: Route) {
  const response = await page.goto(route.url);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  return response;
}

function report(title: string, problems: string[]): string {
  return `${title}:\n${problems.map((problem) => `  - ${problem}`).join('\n')}`;
}

async function readAlternates(page: Page): Promise<Alternate[]> {
  return page.locator('link[rel~="alternate"][hreflang]').evaluateAll((elements) =>
    elements.map((el) => ({
      hreflang: el.getAttribute('hreflang') ?? '',
      href: el.getAttribute('href') ?? '',
    })),
  );
}

const byHreflang = (a: Alternate, b: Alternate) => a.hreflang.localeCompare(b.hreflang);

interface CheckedRoute extends Route {
  /** The HTTP status the page is served with. */
  status: number;
}

/**
 * The 404 page is not in the sitemap, but every visitor who follows a broken
 * link sees it, so it gets the same checks — served with 404, and without
 * hreflang alternates (it has no language counterpart).
 */
const NOT_FOUND_PATH = '/de/diese-seite-gibt-es-nicht/';
const NOT_FOUND: CheckedRoute = {
  path: NOT_FOUND_PATH,
  locale: 'de',
  expectedLang: GERMAN,
  url: new URL(NOT_FOUND_PATH.slice(1), BASE_URL).href,
  productionUrl: new URL(NOT_FOUND_PATH.slice(1), PRODUCTION_BASE_URL).href,
  alternates: [],
  status: 404,
};

const ROUTES: CheckedRoute[] = [
  ...loadSitemapRoutes().map((route) => ({ ...route, status: 200 })),
  NOT_FOUND,
];

for (const route of ROUTES) {
  for (const viewport of VIEWPORTS) {
    test.describe(`${route.path} @ ${viewport.width}px`, () => {
      test.use({ viewport });

      test(`responds ${route.status} with its language, one h1, the landmarks and an icon`, async ({
        page,
      }) => {
        const response = await open(page, route);

        expect.soft(response?.status(), 'HTTP status').toBe(route.status);
        expect
          .soft(route.expectedLang, `"${route.locale}" in the path is not a locale of this site`)
          .not.toBeNull();
        await expect
          .soft(page.locator('html'), 'html[lang] matches the locale in the path')
          .toHaveAttribute('lang', route.expectedLang ?? '');
        await expect.soft(page.locator('h1'), 'exactly one h1').toHaveCount(1);
        await expect
          .soft(page.getByRole('banner'), 'one page <header> (banner landmark)')
          .toHaveCount(1);
        await expect.soft(page.getByRole('main'), 'one <main> landmark').toHaveCount(1);
        await expect
          .soft(page.getByRole('contentinfo'), 'one page <footer> (contentinfo landmark)')
          .toHaveCount(1);
        // Without one, browsers look for /favicon.ico at the host root — outside
        // the base path, so the site's own icon is never found. The link check
        // below proves the declared icon resolves.
        expect
          .soft(
            await page.locator('head link[rel~="icon" i][href]').count(),
            'the page declares an icon (<link rel="icon">)',
          )
          .toBeGreaterThan(0);
      });

      test('skip link is the first focusable element and moves focus to main', async ({ page }) => {
        await open(page, route);
        await page.keyboard.press('Tab');

        const first = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          return {
            tag: el.tagName.toLowerCase(),
            skipLink: el.classList.contains('skip-link'),
            href: el.getAttribute('href'),
            text: (el.textContent ?? '').trim(),
          };
        });
        expect(
          first,
          'the first Tab stop is the skip link (a.skip-link, href="#main")',
        ).toMatchObject({ tag: 'a', skipLink: true, href: '#main' });
        await expect(
          page.locator('a.skip-link'),
          'the focused skip link is visible on screen',
        ).toBeInViewport();

        await expect(page.locator('main#main'), 'the skip link target is <main>').toHaveCount(1);
        await page.keyboard.press('Enter');
        await expect(
          page.locator('main#main'),
          'activating the skip link moves focus to <main>',
        ).toBeFocused();
      });

      test('has no horizontal overflow', async ({ page }) => {
        await open(page, route);

        const layout = await page.evaluate(() => {
          const root = document.documentElement;
          const limit = root.clientWidth;
          const clipped = (el: Element) => {
            for (let p = el.parentElement; p && p !== root; p = p.parentElement) {
              if (getComputedStyle(p).overflowX !== 'visible') return true;
            }
            return false;
          };
          const describe = (el: Element) =>
            el.tagName.toLowerCase() +
            (el.id ? `#${el.id}` : '') +
            (typeof el.className === 'string' && el.className.trim()
              ? `.${el.className.trim().split(/\s+/).slice(0, 4).join('.')}`
              : '');
          const offenders = Array.from(document.body.querySelectorAll('*'))
            .filter((el) => {
              const rect = el.getBoundingClientRect();
              return rect.width > 0 && rect.right > limit + 0.5 && !clipped(el);
            })
            .slice(0, 8)
            .map(
              (el) => `${describe(el)} ends at ${Math.round(el.getBoundingClientRect().right)}px`,
            );
          return { scrollWidth: root.scrollWidth, clientWidth: limit, offenders };
        });

        expect(
          layout.scrollWidth,
          report(
            `page is ${layout.scrollWidth}px wide in a ${layout.clientWidth}px viewport; widest elements`,
            layout.offenders.length > 0
              ? layout.offenders
              : ['(none found outside a clipping box)'],
          ),
        ).toBeLessThanOrEqual(layout.clientWidth);
      });

      test('logs no console errors and no page errors', async ({ page }) => {
        const errors = collectPageErrors(page);
        await open(page, route);
        await page.waitForLoadState('networkidle');

        // A page served with an error status logs that status for its own
        // document; that one entry is the page doing its job, not a fault.
        const unexpected =
          route.status === 200
            ? errors
            : errors.filter(
                (e) => !(e.includes('Failed to load resource') && e.includes(`(${route.url}:`)),
              );
        expect(unexpected.length, report('errors while loading the page', unexpected)).toBe(0);
      });

      test('has no axe violations (WCAG 2.2 A and AA)', async ({ page }, testInfo) => {
        await open(page, route);
        const { violations, incomplete } = await runAxe(page);

        // What axe could not decide — e.g. contrast of text over the decorative
        // background — is not a pass. It is listed in the report, not failed.
        if (incomplete.length > 0) {
          testInfo.annotations.push({
            type: 'axe-incomplete',
            description: incomplete.map((r) => `${r.id} (${r.nodes.length} nodes)`).join(', '),
          });
        }
        if (violations.length > 0) {
          await testInfo.attach('axe-violations.json', {
            body: JSON.stringify(violations, null, 2),
            contentType: 'application/json',
          });
        }
        expect(
          violations.length,
          `axe rule violations on ${route.path} at ${viewport.width}px:\n${formatViolations(violations)}`,
        ).toBe(0);
      });

      test('internal links resolve and every fragment exists', async ({
        page,
        request,
        context,
      }) => {
        await open(page, route);
        // <a> and <area> in the page, <link> in the head (icon, stylesheet, sitemap, …).
        const links = await page
          .locator('a[href], area[href], link[href]')
          .evaluateAll((elements) =>
            elements.map((el) => ({
              raw: el.getAttribute('href') ?? '',
              href:
                el instanceof HTMLAnchorElement ||
                el instanceof HTMLAreaElement ||
                el instanceof HTMLLinkElement
                  ? el.href
                  : '',
              text:
                el instanceof HTMLLinkElement
                  ? `<link rel="${el.rel}">`
                  : `"${(el instanceof HTMLElement ? el.innerText : (el.textContent ?? ''))
                      .replace(/\s+/g, ' ')
                      .trim()
                      .slice(0, 60)}"`,
            })),
          );

        const problems = new Set<string>();
        for (const link of links) {
          const label = `href="${link.raw}"${link.text ? ` (${link.text})` : ''}`;
          const raw = link.raw.trim();
          if (raw === '' || raw === '#') {
            problems.add(`${label}: placeholder link without a target`);
            continue;
          }

          // A fragment on this very page (the skip link) is checked in the page
          // already open. Fetching the URL again would ask the 404 page for
          // itself and get its 404.
          if (raw.startsWith('#')) {
            let id = raw.slice(1);
            try {
              id = decodeURIComponent(id);
            } catch {
              /* keep the raw fragment */
            }
            if ((await page.locator(`[id="${id.replace(/"/g, '\\"')}"]`).count()) === 0) {
              problems.add(`${label}: this page has no element id="${id}"`);
            }
            continue;
          }

          const target = toLocalUrl(link.href);
          if (!target) continue; // another site, mailto:, tel:

          if (!new URL(target).pathname.startsWith(BASE_PATH)) {
            problems.add(`${label}: leaves the site's base path ${BASE_PATH}`);
            continue;
          }

          const info = await resolveTarget(target, { request, context });
          const where = routePathOf(target) ?? target;
          if (info.status !== 200) {
            problems.add(`${label}: ${where} answers ${info.status || info.error}`);
            continue;
          }
          if (!info.existsInDist) {
            problems.add(
              `${label}: ${where} has no file in dist/ with this exact spelling ` +
                '(GitHub Pages is case-sensitive)',
            );
            continue;
          }

          const hash = new URL(link.href).hash.slice(1);
          if (hash) {
            let id = hash;
            try {
              id = decodeURIComponent(hash);
            } catch {
              /* keep the raw fragment */
            }
            if (!info.ids.includes(id))
              problems.add(`${label}: ${where} has no element id="${id}"`);
          }
        }

        expect(problems.size, report(`broken internal links`, [...problems])).toBe(0);
      });

      test('links that open a new tab carry rel="noopener"', async ({ page }) => {
        await open(page, route);
        const offenders = await page
          .locator('a[target="_blank" i], area[target="_blank" i]')
          .evaluateAll((elements) =>
            elements
              .filter(
                (el) =>
                  !(el.getAttribute('rel') ?? '').toLowerCase().split(/\s+/).includes('noopener'),
              )
              .map((el) => el.outerHTML.replace(/\s+/g, ' ').slice(0, 160)),
          );

        expect(offenders.length, report('target="_blank" without rel="noopener"', offenders)).toBe(
          0,
        );
      });

      test('hreflang alternates are reciprocal and x-default is the German page', async ({
        page,
        request,
        context,
      }) => {
        test.skip(route === NOT_FOUND, 'The 404 page has no language counterpart.');
        await open(page, route);
        const alternates = await readAlternates(page);
        const problems: string[] = [];

        const values = alternates.map((a) => a.hreflang);
        for (const value of new Set(values)) {
          if (values.filter((v) => v === value).length > 1) {
            problems.push(`hreflang="${value}" appears more than once`);
          }
        }
        for (const alt of alternates) {
          if (!/^https?:\/\//.test(alt.href)) {
            problems.push(`hreflang="${alt.hreflang}" href "${alt.href}" is not an absolute URL`);
          }
        }

        const self = alternates.filter((a) => a.hreflang === route.expectedLang);
        if (self.length !== 1 || self[0].href !== route.productionUrl) {
          problems.push(
            `no self-reference: expected hreflang="${route.expectedLang}" → ${route.productionUrl}, ` +
              `found ${self.map((a) => a.href).join(', ') || 'none'}`,
          );
        }

        const german = alternates.find((a) => a.hreflang === GERMAN);
        const xDefault = alternates.find((a) => a.hreflang === 'x-default');
        if (german && xDefault?.href !== german.href) {
          problems.push(
            `x-default must be the German page ${german.href}, found ${xDefault?.href ?? 'none'}`,
          );
        }
        if (german && !routePathOf(german.href)?.startsWith(`/${DEFAULT_LOCALE}/`)) {
          problems.push(`hreflang="${GERMAN}" → ${german.href} is not under /${DEFAULT_LOCALE}/`);
        }

        const sitemap = [...route.alternates].sort(byHreflang);
        const head = [...alternates].sort(byHreflang);
        if (JSON.stringify(head) !== JSON.stringify(sitemap)) {
          problems.push(
            `<head> and sitemap.xml disagree: head ${JSON.stringify(head)}, ` +
              `sitemap ${JSON.stringify(sitemap)}`,
          );
        }

        for (const alt of alternates) {
          if (alt.hreflang === 'x-default' || alt.hreflang === route.expectedLang) continue;
          const target = toLocalUrl(alt.href);
          if (!target) {
            problems.push(`hreflang="${alt.hreflang}" → ${alt.href} is not a page of this site`);
            continue;
          }
          const info = await resolveTarget(target, { request, context });
          if (info.status !== 200) {
            problems.push(`hreflang="${alt.hreflang}" → ${alt.href} answers ${info.status}`);
            continue;
          }
          if (info.lang !== alt.hreflang) {
            problems.push(`${alt.href} declares html[lang="${info.lang}"], not "${alt.hreflang}"`);
          }
          const back = info.alternates.filter((a) => a.hreflang === route.expectedLang);
          if (back.length !== 1 || back[0].href !== route.productionUrl) {
            problems.push(
              `${alt.href} does not link back: its hreflang="${route.expectedLang}" is ` +
                `${back.map((a) => a.href).join(', ') || 'missing'}`,
            );
          }
          const theirs = info.alternates.find((a) => a.hreflang === 'x-default')?.href;
          if (theirs !== xDefault?.href) {
            problems.push(
              `${alt.href} has x-default ${theirs ?? 'none'}, this page has ${xDefault?.href ?? 'none'}`,
            );
          }
        }

        expect(problems.length, report('hreflang problems', problems)).toBe(0);
      });
    });
  }
}
