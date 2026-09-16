import { expect, test } from '@playwright/test';

/**
 * Acceptance: Talks & Media (board 8c). Written by the manager before the page
 * was built; see docs/plans/remaining-pages.md, Unit T.
 */

const ROUTES = { de: 'de/vortraege-medien/', en: 'en/talks-media/' } as const;

/** Talks, outlets and a quote on the board that no verified source supports. */
const UNVERIFIED = [
  'DGPs',
  'Lange Nacht der Forschung',
  'Ö1',
  'Radiokolleg',
  'Der Standard',
  'Psychologie to go',
  'PMS ist kein Stimmungsproblem',
];

/** The lilac tint, rgb of --color-lilac-tint. */
const TINT = 'rgb(233, 228, 241)';

for (const [, route] of Object.entries(ROUTES)) {
  test.describe(`talks-media ${route}`, () => {
    test(`${route} lists the verified conference contribution`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('main')).toContainText(
        /ICBM|International Congress of Behavioral Medicine/,
      );
    });

    test(`${route} keeps the board's unverified talks, media and quote off the page`, async ({
      page,
    }) => {
      await page.goto(route);
      const main = page.locator('main');
      for (const claim of UNVERIFIED) await expect(main, claim).not.toContainText(claim);
    });

    test(`${route} uses no address on the not-yet-existing domain`, async ({ request }) => {
      const html = await (await request.get(route)).text();
      expect(html).not.toContain('celinebencker.com');
    });

    test(`${route} has no "all talks / all media" links without a target`, async ({ page }) => {
      await page.goto(route);
      await expect(
        page.getByRole('link', { name: /Alle Talks|Alle Beiträge|All talks|All media/i }),
      ).toHaveCount(0);
    });

    test(`${route} offers a way to write for press enquiries`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('main a[href^="mailto:"]').first()).toBeVisible();
    });

    test(`${route} has exactly one lilac-tint section`, async ({ page }) => {
      await page.goto(route);
      const regions = await page.locator('main').evaluate((main, tint) => {
        const tinted = [...main.querySelectorAll<HTMLElement>('*')].filter(
          (el) => getComputedStyle(el).backgroundColor === tint,
        );
        // Top-most tinted regions only; ignore tinted elements nested in one.
        return tinted.filter((el) => !tinted.some((o) => o !== el && o.contains(el))).length;
      }, TINT);
      expect(regions).toBe(1);
    });
  });
}
