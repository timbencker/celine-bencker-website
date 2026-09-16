import { expect, test } from '@playwright/test';

/**
 * Acceptance: CV (board 7b). Written by the manager before the page was built;
 * see docs/plans/remaining-pages.md, Unit V.
 *
 * The board's CV contradicts Celine's ORCID record (it lists degrees from
 * Salzburg; ORCID lists the University of Vienna). These tests pin the page to
 * the verified record and keep the board's unverified specifics off it.
 */

const ROUTES = { de: 'de/lebenslauf/', en: 'en/cv/' } as const;

/** Specific claims from the board that no verified source supports. */
const UNVERIFIED = ['Salzburg', 'Uppsala', 'DGPs', 'ISPNE'];

for (const [locale, route] of Object.entries(ROUTES)) {
  test.describe(`cv ${route}`, () => {
    test(`${route} shows the verified education`, async ({ page }) => {
      await page.goto(route);
      const main = page.locator('main');
      await expect(main).toContainText(
        locale === 'de' ? 'Universität Wien' : 'University of Vienna',
      );
      for (const year of ['2015', '2019', '2022']) await expect(main, year).toContainText(year);
    });

    test(`${route} shows the verified positions and funding`, async ({ page }) => {
      await page.goto(route);
      const main = page.locator('main');
      await expect(main).toContainText('Hanusch');
      await expect(main).toContainText('2023');
      await expect(main).toContainText(
        locale === 'de' ? /Akademie der Wissenschaften|ÖAW/ : /Academy of Sciences|ÖAW/,
      );
    });

    test(`${route} shows the verified peer review`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('main')).toContainText('Psychoneuroendocrinology');
    });

    test(`${route} derives its publications from the publication list`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('main')).toContainText('BMJ Open');
    });

    test(`${route} keeps the board's unverified specifics off the page`, async ({ page }) => {
      await page.goto(route);
      const main = page.locator('main');
      for (const claim of UNVERIFIED) await expect(main, claim).not.toContainText(claim);
      if (locale === 'de') await expect(main).not.toContainText(/seit 2024/);
    });

    test(`${route} links no download that does not exist`, async ({ page, request }) => {
      await page.goto(route);
      for (const href of await page
        .locator('a[href$=".pdf"]')
        .evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href))) {
        expect((await request.get(href)).status(), href).toBe(200);
      }
    });
  });
}
