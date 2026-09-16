import { expect, test, type Page } from '@playwright/test';

/**
 * Acceptance: Research (board 10b). Written by the manager before the page was
 * built; see docs/plans/remaining-pages.md, Unit R.
 */

const ROUTES = { de: 'de/forschung/', en: 'en/research/' } as const;

/** Home links to these anchors; they must exist on the page. */
const LINE_IDS = ['pms-stress', 'stress-im-alltag', 'hormone-gehirn-stimmung'];

/** Verified DOIs (ORCID + Crossref) the page links under its lines. */
const DOIS = [
  '10.1136/bmjopen-2026-123210', // ISSAC protocol, BMJ Open 2026
  '10.1192/bjp.2025.10311', // BJPsych 2025
  '10.1016/j.yfrne.2024.101160', // Frontiers in Neuroendocrinology 2025
];

async function scriptCount(page: Page) {
  return page.locator('script:not([type="application/ld+json"])').count();
}

for (const [locale, route] of Object.entries(ROUTES)) {
  test.describe(`research ${route}`, () => {
    test(`${route} has an anchor for every research line`, async ({ page }) => {
      await page.goto(route);
      for (const id of LINE_IDS) {
        await expect(page.locator(`#${id}`), `#${id}`).toHaveCount(1);
      }
    });

    test(`${route} links the verified papers by DOI`, async ({ page }) => {
      await page.goto(route);
      for (const doi of DOIS) {
        await expect(page.locator(`a[href="https://doi.org/${doi}"]`).first(), doi).toBeVisible();
      }
    });

    test(`${route} has no placeholder links`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('a[href="#"]')).toHaveCount(0);
    });

    test(`${route} offers exactly two registers`, async ({ page }) => {
      await page.goto(route);
      const radios = page.locator('main').getByRole('radio');
      await expect(radios).toHaveCount(2);
      await expect(radios.first()).toBeChecked();
    });

    test(`${route} ships no JavaScript beyond the language memory`, async ({ page }) => {
      await page.goto(route);
      expect(await scriptCount(page)).toBeLessThanOrEqual(1);
    });

    if (locale === 'de') {
      test(`${route} title is the research question`, async ({ page }) => {
        await page.goto(route);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(/\?\s*$/);
      });

      test(`${route} has the Methods and Collaboration sections`, async ({ page }) => {
        await page.goto(route);
        await expect(page.getByRole('heading', { level: 2, name: 'Methoden' })).toBeVisible();
        await expect(page.getByRole('heading', { level: 2, name: 'Zusammenarbeit' })).toBeVisible();
      });
    }
  });
}

test.describe('research register toggle without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test(`${ROUTES.de} switches the whole page to plain language`, async ({ page }) => {
    await page.goto(ROUTES.de);
    const line = page.locator('#pms-stress');
    const expert = await line.innerText();

    await page.getByRole('radio', { name: 'Einfach erklärt' }).check();

    await expect(page.getByRole('radio', { name: 'Einfach erklärt' })).toBeChecked();
    const plain = await line.innerText();
    expect(plain.trim().length).toBeGreaterThan(0);
    expect(plain).not.toEqual(expert);

    // Every line still shows text in the plain register.
    for (const id of LINE_IDS) {
      expect((await page.locator(`#${id}`).innerText()).trim().length, id).toBeGreaterThan(0);
    }
  });

  test(`${ROUTES.en} falls back to the specialist text where no plain text exists`, async ({
    page,
  }) => {
    await page.goto(ROUTES.en);
    await page.locator('main').getByRole('radio').nth(1).check();
    for (const id of LINE_IDS) {
      expect((await page.locator(`#${id}`).innerText()).trim().length, id).toBeGreaterThan(0);
    }
  });
});
