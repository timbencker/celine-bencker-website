import { expect, test } from '@playwright/test';

/**
 * Acceptance: Publications (board 7a). Written by the manager before the page
 * was built; see docs/plans/remaining-pages.md, Unit P.
 *
 * Every fact asserted here comes from Celine's public ORCID record and the
 * Crossref metadata of her DOIs (design/sources/).
 */

const ROUTES = { de: 'de/publikationen/', en: 'en/publications/' } as const;

const ARTICLES = [
  { doi: '10.1136/bmjopen-2026-123210', venue: 'BMJ Open', year: 2026, coauthor: 'Schmalenberger' },
  {
    doi: '10.1192/bjp.2025.10311',
    venue: 'British Journal of Psychiatry',
    year: 2025,
    coauthor: 'Tran, U. S.',
  },
  {
    doi: '10.1016/j.yfrne.2024.101160',
    venue: 'Frontiers in Neuroendocrinology',
    year: 2025,
    coauthor: 'Sundström-Poromaa',
  },
  {
    doi: '10.3389/fpsyg.2024.1405272',
    venue: 'Frontiers in Psychology',
    year: 2024,
    coauthor: 'Laireiter',
  },
  {
    doi: '10.1016/j.eclinm.2023.102318',
    venue: 'eClinicalMedicine',
    year: 2023,
    coauthor: 'Keil, F.',
  },
];

/** Preprints whose published version is listed instead. */
const SUPERSEDED = ['10.31234/osf.io/z4uce', '10.2139/ssrn.4437883'];

for (const [locale, route] of Object.entries(ROUTES)) {
  test.describe(`publications ${route}`, () => {
    test(`${route} lists every verified article with venue and co-authors`, async ({ page }) => {
      await page.goto(route);
      const main = page.locator('main');
      for (const a of ARTICLES) {
        await expect(
          main.locator(`a[href="https://doi.org/${a.doi}"]`).first(),
          a.doi,
        ).toBeVisible();
        await expect(main, a.venue).toContainText(a.venue);
        await expect(main, a.coauthor).toContainText(a.coauthor);
      }
    });

    test(`${route} lists a paper once, not also its preprint`, async ({ page }) => {
      await page.goto(route);
      for (const doi of SUPERSEDED) {
        await expect(page.locator(`a[href*="${doi}"]`), doi).toHaveCount(0);
      }
      await expect(
        page.locator('main').getByText(/Associations between premenstrual symptoms/i),
      ).toHaveCount(1);
    });

    test(`${route} groups by year, newest first, each paper under its year`, async ({ page }) => {
      await page.goto(route);
      const years = (await page.getByRole('heading', { level: 2 }).allInnerTexts())
        .map((t) => t.trim())
        .filter((t) => /^\d{4}$/.test(t));
      expect(years).toEqual(['2026', '2025', '2024', '2023']);

      for (const a of ARTICLES) {
        const placed = await page.evaluate(
          ({ doi, year }) => {
            const link = document.querySelector(`a[href="https://doi.org/${doi}"]`);
            const heads = [...document.querySelectorAll('h2')].filter((h) =>
              /^\d{4}$/.test(h.textContent?.trim() ?? ''),
            );
            const own = heads.find((h) => h.textContent?.trim() === String(year));
            if (!link || !own) return false;
            const after = (n: Node) =>
              !!(own.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING);
            const next = heads[heads.indexOf(own) + 1];
            const beforeNext =
              !next || !!(link.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING);
            return after(link) && beforeNext;
          },
          { doi: a.doi, year: a.year },
        );
        expect(placed, `${a.doi} under ${a.year}`).toBe(true);
      }
    });

    test(`${route} sets Celine's name in bold in every entry`, async ({ page }) => {
      await page.goto(route);
      const bold = page.locator('main').locator('strong, b', { hasText: 'Bencker, C.' });
      expect(await bold.count()).toBeGreaterThanOrEqual(ARTICLES.length);
    });

    test(`${route} offers a BibTeX file that contains every article`, async ({ page, request }) => {
      await page.goto(route);
      const link = page.locator('a[href$=".bib"]').first();
      await expect(link).toBeVisible();
      await expect(link).toContainText(/\d\s?(k?B)/);
      const res = await request.get(new URL((await link.getAttribute('href'))!, page.url()).href);
      expect(res.status()).toBe(200);
      const bib = await res.text();
      expect(bib).toContain('@');
      for (const a of ARTICLES) expect(bib, a.doi).toContain(a.doi);
    });

    test(`${route} has no filter controls`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('header, main').locator('button, select, input')).toHaveCount(0);
    });

    test(`${route} links only verified profiles`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('a[href*="scholar.google"]')).toHaveCount(0);
      await expect(page.locator('a[href*="linkedin.com"]')).toHaveCount(0);
      // The board lists the profiles beside the page title, in the header.
      // The footer's own ORCID link is outside both.
      await expect(
        page.locator(
          'header a[href^="https://orcid.org/0000-0002-3802-1339"], main a[href^="https://orcid.org/0000-0002-3802-1339"]',
        ),
      ).toHaveCount(1);
    });

    test(`${route} does not present the board's unverified manuscript as fact`, async ({
      page,
    }) => {
      await page.goto(route);
      await expect(page.locator('main')).not.toContainText('erste Ergebnisse der ISSAC-Studie');
    });

    if (locale === 'de') {
      test(`${route} shows "Kurz gesagt" on the two selected papers only`, async ({ page }) => {
        await page.goto(route);
        await expect(page.locator('main').getByText('Kurz gesagt', { exact: true })).toHaveCount(2);
      });
    }
  });
}
