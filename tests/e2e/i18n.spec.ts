import { readFileSync } from 'node:fs';

import { type Page, expect, test } from '@playwright/test';

import {
  DEFAULT_LOCALE,
  LOCALE_HTML_LANG,
  type Locale,
  isLocale,
  otherLocale,
} from '../../src/i18n/config';
import { t } from '../../src/i18n/ui';
import { collectPageErrors } from './support/errors';
import { BASE_URL, DIST_DIR, loadSitemapRoutes, toLocalUrl } from './support/site';

/**
 * The language rules from docs/i18n-policy.md: the URL carries the language,
 * the bare root goes to German (or to a language the visitor chose with the
 * switcher), the browser language is never consulted, and the switcher leads
 * to the same page in the other language or is disabled.
 */

const DEFAULT_HOME = `${BASE_URL}${DEFAULT_LOCALE}/`;
const DESKTOP = { width: 1280, height: 800 };

test.describe('root redirect', () => {
  // Every test gets a new browser context: empty localStorage, so no
  // remembered language unless the test sets one.

  test(`the bare base URL lands on /${DEFAULT_LOCALE}/`, async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'commit' });
    await page.waitForURL(DEFAULT_HOME);
    await expect(page.locator('html')).toHaveAttribute('lang', LOCALE_HTML_LANG[DEFAULT_LOCALE]);
  });

  test.describe('with an English browser', () => {
    test.use({ locale: 'en-US' });

    test(`the bare base URL still lands on /${DEFAULT_LOCALE}/`, async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'commit' });
      await page.waitForURL(DEFAULT_HOME);
      await expect(page.locator('html')).toHaveAttribute('lang', LOCALE_HTML_LANG[DEFAULT_LOCALE]);
    });
  });

  test('a language chosen with the switcher applies to the bare root only', async ({ page }) => {
    const other = otherLocale(DEFAULT_LOCALE);
    const otherHome = `${BASE_URL}${other}/`;
    await page.setViewportSize(DESKTOP);

    await page.goto(DEFAULT_HOME);
    await page
      .getByRole('group', { name: t(DEFAULT_LOCALE, 'lang.label'), exact: true })
      .getByRole('link')
      .click();
    await page.waitForURL(otherHome);

    await page.goto(BASE_URL, { waitUntil: 'commit' });
    await page.waitForURL(otherHome);

    // An explicit URL is never overridden by the remembered choice.
    await page.goto(DEFAULT_HOME);
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBe(DEFAULT_HOME);
    await expect(page.locator('html')).toHaveAttribute('lang', LOCALE_HTML_LANG[DEFAULT_LOCALE]);
  });
});

type LanguageControl =
  | { kind: 'link'; href: string }
  | { kind: 'disabled' }
  | { kind: 'invalid'; links: string[]; disabled: number };

/**
 * Every language switcher on the page (the desktop and the phone one), each
 * reduced to its other-language control: a link, or `aria-disabled="true"`.
 */
async function readLanguageControls(page: Page, locale: Locale): Promise<LanguageControl[]> {
  const groups = page.getByRole('group', {
    name: t(locale, 'lang.label'),
    exact: true,
    includeHidden: true,
  });
  const controls: LanguageControl[] = [];
  for (let i = 0; i < (await groups.count()); i++) {
    const group = groups.nth(i);
    const links = await group
      .getByRole('link', { includeHidden: true })
      .evaluateAll((elements) =>
        elements.map((el) => (el instanceof HTMLAnchorElement ? el.href : '')),
      );
    const disabled = await group.locator('[aria-disabled="true"]').count();
    if (links.length === 1 && disabled === 0) controls.push({ kind: 'link', href: links[0] });
    else if (links.length === 0 && disabled === 1) controls.push({ kind: 'disabled' });
    else controls.push({ kind: 'invalid', links, disabled });
  }
  return controls;
}

test.describe('language control', () => {
  test.use({ viewport: DESKTOP });

  for (const route of loadSitemapRoutes()) {
    test(`on ${route.path} leads to the same page in the other language`, async ({ page }) => {
      expect(isLocale(route.locale), `"${route.locale}" is not a locale of this site`).toBe(true);
      const locale = route.locale as Locale;
      const other = otherLocale(locale);
      const counterpartUrl = route.alternates.find(
        (a) => a.hreflang === LOCALE_HTML_LANG[other],
      )?.href;
      const counterpart = counterpartUrl ? toLocalUrl(counterpartUrl) : null;

      await page.goto(route.url);
      const controls = await readLanguageControls(page, locale);
      expect(controls.length, 'language switchers on the page').toBeGreaterThan(0);
      for (const control of controls) {
        expect
          .soft(
            control,
            counterpart
              ? `the ${other.toUpperCase()} control links to ${counterpart}`
              : `no ${other.toUpperCase()} version exists, so the control is aria-disabled`,
          )
          .toEqual(counterpart ? { kind: 'link', href: counterpart } : { kind: 'disabled' });
      }
      if (!counterpart) return;

      await page
        .getByRole('group', { name: t(locale, 'lang.label'), exact: true })
        .getByRole('link')
        .click();
      await page.waitForURL(counterpart);
      await expect(page.locator('html')).toHaveAttribute('lang', LOCALE_HTML_LANG[other]);

      const back = await readLanguageControls(page, other);
      expect(back.length, 'language switchers on the counterpart page').toBeGreaterThan(0);
      for (const control of back) {
        expect
          .soft(control, `the counterpart's ${locale.toUpperCase()} control links back`)
          .toEqual({ kind: 'link', href: route.url });
      }
    });
  }
});

test.describe('missing pages', () => {
  // GitHub Pages answers every missing path in the project with the bytes of
  // dist/404.html and status 404. `astro preview` does the same, so the
  // assertions below describe production.
  for (const path of ['de/does-not-exist/', 'en/does-not-exist', 'de/nicht/vorhanden/tief/']) {
    test(`/${path} gets the 404 page with status 404 and noindex`, async ({ page }) => {
      const errors = collectPageErrors(page, { expectDocumentStatus: 404 });
      const response = await page.goto(path);
      expect(response?.status(), 'HTTP status').toBe(404);
      const body = await response?.body();
      expect(
        body?.equals(readFileSync(`${DIST_DIR}404.html`)),
        'the response is dist/404.html',
      ).toBe(true);

      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        /(^|[\s,])noindex([\s,]|$)/,
      );
      await expect(page.locator('h1'), 'exactly one h1').toHaveCount(1);

      // Assets are linked from the base, so they load at any depth.
      await page.waitForLoadState('networkidle');
      expect(errors, 'console and page errors on the 404 page').toEqual([]);
    });
  }
});
