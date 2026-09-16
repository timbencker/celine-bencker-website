import { expect, test } from '@playwright/test';

/**
 * Acceptance: 404 (board 11a). Written by the manager before the page was
 * built; see docs/plans/remaining-pages.md, Unit N.
 */

const MISSING = 'de/diese-seite-gibt-es-nicht/';

const DE_NAV = [
  '/de/forschung/',
  '/de/publikationen/',
  '/de/vortraege-medien/',
  '/de/lebenslauf/',
  '/de/kontakt/',
];

test.describe(`not-found ${MISSING}`, () => {
  test(`${MISSING} is served as the 404 page, not indexed`, async ({ page }) => {
    const res = await page.goto(MISSING);
    expect(res?.status()).toBe(404);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test(`${MISSING} leads on to every page`, async ({ page }) => {
    await page.goto(MISSING);
    const main = page.locator('main');
    for (const href of DE_NAV) {
      await expect(main.locator(`a[href$="${href}"]`).first(), href).toBeVisible();
    }
  });

  test(`${MISSING} speaks to English readers too`, async ({ page }) => {
    await page.goto(MISSING);
    const main = page.locator('main');
    await expect(main.locator('[lang="en"]').first()).toBeVisible();
    await expect(main.locator('a[href$="/en/"]').first()).toBeVisible();
  });

  test(`${MISSING} offers a way to report the broken link`, async ({ page }) => {
    await page.goto(MISSING);
    await expect(page.locator('main a[href^="mailto:"]').first()).toBeVisible();
  });

  test(`${MISSING} ships no JavaScript beyond the language memory`, async ({ page }) => {
    await page.goto(MISSING);
    expect(await page.locator('script').count()).toBeLessThanOrEqual(1);
  });
});
