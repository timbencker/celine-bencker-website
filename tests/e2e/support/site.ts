import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { LOCALE_HTML_LANG, isLocale } from '../../../src/i18n/config';

/**
 * Where the suite points, and what the built site says it contains.
 *
 * `SITE` and `BASE_PATH` mirror `astro.config.mjs` (same env vars, same
 * defaults), so the suite follows the deployment target if it ever moves to a
 * custom domain.
 */
export const ROOT_DIR = fileURLToPath(new URL('../../../', import.meta.url));
export const DIST_DIR = fileURLToPath(new URL('../../../dist/', import.meta.url));

export const SITE = process.env.SITE ?? 'https://timbencker.github.io';
const rawBase = process.env.BASE_PATH ?? '/celine-bencker-website';
/** The deployment base with leading and trailing slash, e.g. `/celine-bencker-website/`. */
export const BASE_PATH = `/${rawBase.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');

export const E2E_PORT = Number(process.env.E2E_PORT ?? 4330);
if (!Number.isInteger(E2E_PORT) || E2E_PORT < 1 || E2E_PORT > 65535) {
  throw new Error(`E2E_PORT must be a TCP port number, got "${process.env.E2E_PORT}".`);
}

export const LOCAL_ORIGIN = `http://localhost:${E2E_PORT}`;
/** `http://localhost:<port>/celine-bencker-website/` — the Playwright baseURL. */
export const BASE_URL = `${LOCAL_ORIGIN}${BASE_PATH}`;
/** `https://timbencker.github.io/celine-bencker-website/` — what the sitemap and hreflang use. */
export const PRODUCTION_BASE_URL = new URL(BASE_PATH, SITE).href;

/** Where the per-run site index (see global-setup.ts) is written. */
export const SITE_INDEX_PATH = fileURLToPath(
  new URL('../../../test-results/site-index.json', import.meta.url),
);

export interface Alternate {
  hreflang: string;
  href: string;
}

export interface Route {
  /** Path below the base, e.g. `/de/forschung/`. Every test title carries it. */
  path: string;
  /** The first path segment, e.g. `de`. */
  locale: string;
  /** The value `html[lang]` must have, or `null` when the path has no locale segment. */
  expectedLang: string | null;
  /** Absolute URL on the local preview server. */
  url: string;
  /** Absolute production URL, as written in the sitemap. */
  productionUrl: string;
  /** hreflang alternates the sitemap declares for this page. */
  alternates: Alternate[];
}

const XML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
};

function unescapeXml(value: string): string {
  return value.replace(/&(?:amp|lt|gt|quot|apos);/g, (entity) => XML_ENTITIES[entity] ?? entity);
}

function attributes(tag: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [, name, value] of tag.matchAll(/([\w:-]+)="([^"]*)"/g)) {
    result[name] = unescapeXml(value);
  }
  return result;
}

/**
 * Maps a URL onto the local preview server: production URLs under the base
 * and local URLs pass, everything else (other origins, mailto:, …) is `null`.
 * The fragment is dropped; the query is kept.
 */
export function toLocalUrl(href: string): string | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  url.hash = '';
  if (url.href.startsWith(PRODUCTION_BASE_URL)) {
    return BASE_URL + url.href.slice(PRODUCTION_BASE_URL.length);
  }
  if (url.origin === LOCAL_ORIGIN) return url.href;
  return null;
}

/** `/de/forschung/` for a local or production URL under the base, else `null`. */
export function routePathOf(href: string): string | null {
  const local = toLocalUrl(href);
  if (!local || !local.startsWith(BASE_URL)) return null;
  return `/${local.slice(BASE_URL.length)}`;
}

let routesCache: Route[] | undefined;

/**
 * Every page listed in the built `dist/sitemap.xml`. Read synchronously at
 * collection time: in a normal run Playwright starts the webServer (which
 * builds) before it loads the spec files, so the sitemap is always fresh.
 */
export function loadSitemapRoutes(): Route[] {
  if (routesCache) return routesCache;

  const sitemapPath = `${DIST_DIR}sitemap.xml`;
  if (!existsSync(sitemapPath)) {
    throw new Error(
      `${sitemapPath} does not exist. \`npm run test:e2e\` builds it first; ` +
        'for `--list` (which starts no server), run `npm run build` beforehand.',
    );
  }

  const xml = readFileSync(sitemapPath, 'utf8');
  const routes: Route[] = [];

  for (const [, block] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = /<loc>([\s\S]*?)<\/loc>/.exec(block)?.[1];
    if (!loc) throw new Error(`A sitemap <url> has no <loc>: ${block}`);
    const productionUrl = unescapeXml(loc.trim());

    const path = routePathOf(productionUrl);
    const url = toLocalUrl(productionUrl);
    if (!path || !url || !productionUrl.startsWith(PRODUCTION_BASE_URL)) {
      throw new Error(`Sitemap URL ${productionUrl} is not under ${PRODUCTION_BASE_URL}.`);
    }

    const alternates = [...block.matchAll(/<xhtml:link\b[^>]*>/g)]
      .map(([tag]) => attributes(tag))
      .filter((attrs) => attrs.rel === 'alternate' && attrs.hreflang)
      .map((attrs) => ({ hreflang: attrs.hreflang, href: attrs.href ?? '' }));

    const locale = path.split('/')[1] ?? '';
    routes.push({
      path,
      locale,
      expectedLang: isLocale(locale) ? LOCALE_HTML_LANG[locale] : null,
      url,
      productionUrl,
      alternates,
    });
  }

  if (routes.length === 0) throw new Error(`${sitemapPath} lists no pages.`);
  const paths = routes.map((r) => r.path);
  const duplicates = paths.filter((p, i) => paths.indexOf(p) !== i);
  if (duplicates.length > 0) {
    throw new Error(`${sitemapPath} lists pages more than once: ${duplicates.join(', ')}`);
  }

  routesCache = routes;
  return routes;
}

let distFilesCache: Set<string> | undefined;

/**
 * Whether a URL path below the base maps to a file in `dist/` with exactly this
 * spelling. GitHub Pages is case-sensitive; the local preview on Windows is
 * not, so a 200 locally is not enough to prove the link works in production.
 */
export function distHasExactPath(pathname: string): boolean {
  distFilesCache ??= new Set(
    readdirSync(DIST_DIR, { recursive: true, encoding: 'utf8' }).map((p) => p.replace(/\\/g, '/')),
  );
  if (!pathname.startsWith(BASE_PATH)) return false;

  let relative: string;
  try {
    relative = decodeURIComponent(pathname.slice(BASE_PATH.length));
  } catch {
    return false;
  }

  const candidates =
    relative === '' || relative.endsWith('/')
      ? [`${relative}index.html`]
      : [relative, `${relative}/index.html`, `${relative}.html`];
  return candidates.some((candidate) => distFilesCache?.has(candidate));
}
