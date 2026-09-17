import { DEFAULT_LOCALE, LOCALE_HTML_LANG } from '../../../src/i18n/config';
import { BASE_URL, PRODUCTION_BASE_URL, type Route, loadSitemapRoutes } from './site';

/** A page the suite checks, with the HTTP status it must be served with. */
export interface CheckedRoute extends Route {
  status: number;
}

/**
 * The 404 page is not in the sitemap, but every visitor who follows a broken
 * link sees it, so it gets the same checks — served with 404, and without
 * hreflang alternates (it has no language counterpart).
 */
const NOT_FOUND_PATH = '/de/diese-seite-gibt-es-nicht/';
export const NOT_FOUND: CheckedRoute = {
  path: NOT_FOUND_PATH,
  locale: DEFAULT_LOCALE,
  expectedLang: LOCALE_HTML_LANG[DEFAULT_LOCALE],
  url: new URL(NOT_FOUND_PATH.slice(1), BASE_URL).href,
  productionUrl: new URL(NOT_FOUND_PATH.slice(1), PRODUCTION_BASE_URL).href,
  alternates: [],
  status: 404,
};

/** Every page in the built sitemap, plus the 404 page. */
export function checkedRoutes(): CheckedRoute[] {
  return [...loadSitemapRoutes().map((route) => ({ ...route, status: 200 })), NOT_FOUND];
}
