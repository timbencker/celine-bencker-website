import { expect, test } from '@playwright/test';

/**
 * Acceptance: Contact (board 9b). Written by the manager before the page was
 * built; see docs/plans/remaining-pages.md, Unit K.
 */

const ROUTES = {
  de: {
    route: 'de/kontakt/',
    title: 'Kontakt',
    research: '/de/forschung/#',
    talks: '/de/vortraege-medien/',
  },
  en: {
    route: 'en/contact/',
    title: 'Contact',
    research: '/en/research/#',
    talks: '/en/talks-media/',
  },
} as const;

for (const [, p] of Object.entries(ROUTES)) {
  test.describe(`contact ${p.route}`, () => {
    test(`${p.route} is titled ${p.title}`, async ({ page }) => {
      await page.goto(p.route);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(p.title);
    });

    test(`${p.route} has the Impressum section the footer links to`, async ({ page }) => {
      await page.goto(p.route);
      const imprint = page.locator('#impressum');
      await expect(imprint).toHaveCount(1);
      await expect(
        page.locator('#impressum').locator('xpath=self::h2|.//h2').first(),
      ).toBeVisible();
    });

    test(`${p.route} offers three ways to get in touch`, async ({ page }) => {
      await page.goto(p.route);
      const main = page.locator('main');
      await expect(main.locator('a[href^="mailto:"][href*="subject="]').first()).toBeVisible();
      await expect(main.locator(`a[href*="${p.research}"]`).first()).toBeVisible();
      await expect(main.locator(`a[href$="${p.talks}"]`).first()).toBeVisible();
    });

    test(`${p.route} links only verified profiles`, async ({ page }) => {
      await page.goto(p.route);
      const main = page.locator('main');
      await expect(main.locator('a[href="https://orcid.org/0000-0002-3802-1339"]')).toHaveCount(1);
      await expect(main.locator('a[href*="ucrisportal.univie.ac.at"]')).toHaveCount(1);
      await expect(page.locator('a[href*="scholar.google"], a[href*="linkedin.com"]')).toHaveCount(
        0,
      );
    });

    test(`${p.route} keeps the unverified street address off the page`, async ({ page }) => {
      await page.goto(p.route);
      await expect(page.locator('main')).not.toContainText('Liebiggasse');
    });

    test(`${p.route} never writes the address in plain text`, async ({ request }) => {
      const html = await (await request.get(p.route)).text();
      expect(html).not.toContain('celine.bencker@univie.ac.at');
      expect(html).not.toContain('celine.bencker');
    });
  });
}
