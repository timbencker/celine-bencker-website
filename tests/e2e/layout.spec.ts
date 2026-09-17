import { expect, test } from '@playwright/test';

import { findMidWordBreaks, measureOverflow } from './support/layout';
import { open, report } from './support/page';
import { checkedRoutes } from './support/routes';

/**
 * The layout holds at every width, not only at the three that site.spec.ts
 * audits in depth. The widths straddle the tiers in src/styles/tokens.css:
 * phone below 768px, tablet from 768px, desktop from 1120px.
 *
 * One test per page and width, one page load each. What each check
 * guarantees: tests/README.md.
 */

const WIDTHS = [360, 390, 768, 900, 1119, 1120, 1280, 1920];

/** `--breakpoint-desktop` in tokens.css. */
const DESKTOP = 1120;

/** Widths whose overflow site.spec.ts already checks. */
const OVERFLOW_CHECKED_ELSEWHERE = new Set([375, 768, 1280]);

for (const route of checkedRoutes()) {
  for (const width of WIDTHS) {
    test.describe(`${route.path} @ ${width}px`, () => {
      test.use({ viewport: { width, height: 900 } });

      test('layout holds: no overflow, no split words, the navigation of its tier', async ({
        page,
      }) => {
        await open(page, route);
        const problems: string[] = [];

        if (!OVERFLOW_CHECKED_ELSEWHERE.has(width)) {
          const overflow = await measureOverflow(page);
          if (overflow.scrollWidth > overflow.clientWidth) {
            problems.push(
              `page is ${overflow.scrollWidth}px wide in a ${overflow.clientWidth}px viewport: ` +
                (overflow.offenders.join('; ') || 'no single element found'),
            );
          }
        }

        for (const split of await findMidWordBreaks(page)) {
          problems.push(`word split mid-word: ${split}`);
        }

        // SiteNav renders the desktop links as the header's own <nav>, and the
        // phone menu as a <details> disclosure beside it.
        const desktopNav = page.locator('header > nav');
        const menuControl = page.locator('header details > summary');

        if (width < DESKTOP) {
          if (!(await menuControl.isVisible())) problems.push('the menu control is not visible');
          if (await desktopNav.isVisible()) problems.push('the desktop navigation is visible');
        } else {
          if (!(await desktopNav.isVisible())) problems.push('the desktop navigation is hidden');
          if (await menuControl.isVisible()) problems.push('the menu control is visible');

          const rows = await desktopNav
            .locator('li')
            .evaluateAll((items) => [
              ...new Set(items.map((li) => Math.round(li.getBoundingClientRect().top))),
            ]);
          if (rows.length > 1) {
            problems.push(`the desktop navigation wraps to ${rows.length} rows`);
          }

          // The measuring-dot motif is anchored to this height (Background.astro).
          const footer = await page.evaluate(() => {
            const expected = getComputedStyle(document.documentElement)
              .getPropertyValue('--footer-h')
              .trim();
            const actual = (
              document.querySelector('body > footer') ?? document.querySelector('footer')
            )?.getBoundingClientRect();
            return { expected, actual: actual ? Math.round(actual.height) : null };
          });
          if (!footer.expected) {
            problems.push('--footer-h is not defined');
          } else if (footer.actual !== Math.round(Number.parseFloat(footer.expected))) {
            problems.push(
              `the footer is ${footer.actual}px tall, --footer-h is ${footer.expected}`,
            );
          }
        }

        expect(problems.length, report(`layout problems at ${width}px`, problems)).toBe(0);
      });
    });
  }
}
