import { existsSync, readFileSync } from 'node:fs';

import type { APIRequestContext, BrowserContext, Page } from '@playwright/test';

import { type Alternate, SITE_INDEX_PATH, distHasExactPath } from './site';

/**
 * What the suite knows about one link target. Link, fragment and hreflang
 * checks all look targets up here, so each target is requested once per run:
 * global-setup.ts inspects every sitemap page and every internal link they
 * contain before the tests start, and writes the result to SITE_INDEX_PATH.
 */
export interface TargetInfo {
  /** The requested local URL, without fragment. */
  url: string;
  /** The URL after redirects. */
  finalUrl: string;
  /** Final HTTP status; 0 when the request itself failed. */
  status: number;
  contentType: string;
  /** Whether `dist/` has a file with exactly this spelling (GitHub Pages is case-sensitive). */
  existsInDist: boolean;
  /** Every element id on the page (HTML only). */
  ids: string[];
  lang: string | null;
  alternates: Alternate[];
  error?: string;
}

export type SiteIndex = Record<string, TargetInfo>;

export async function inspectTarget(
  request: APIRequestContext,
  page: Page,
  url: string,
): Promise<TargetInfo> {
  const info: TargetInfo = {
    url,
    finalUrl: url,
    status: 0,
    contentType: '',
    existsInDist: false,
    ids: [],
    lang: null,
    alternates: [],
  };

  try {
    const response = await request.get(url, { failOnStatusCode: false, maxRedirects: 10 });
    info.status = response.status();
    info.finalUrl = response.url();
    info.contentType = response.headers()['content-type'] ?? '';
    await response.dispose();
  } catch (error) {
    info.error = error instanceof Error ? error.message : String(error);
    return info;
  }

  info.existsInDist = distHasExactPath(new URL(info.finalUrl).pathname);

  if (info.status === 200 && info.contentType.includes('text/html')) {
    await page.goto(info.finalUrl);
    Object.assign(
      info,
      await page.evaluate(() => ({
        ids: Array.from(document.querySelectorAll('[id]'), (el) => el.id),
        lang: document.documentElement.getAttribute('lang'),
        alternates: Array.from(
          document.querySelectorAll('link[rel~="alternate"][hreflang]'),
          (el) => ({
            hreflang: el.getAttribute('hreflang') ?? '',
            href: el.getAttribute('href') ?? '',
          }),
        ),
      })),
    );
  }

  return info;
}

let indexCache: SiteIndex | undefined;
const fallback = new Map<string, Promise<TargetInfo>>();

function loadIndex(): SiteIndex {
  if (!existsSync(SITE_INDEX_PATH)) return {};
  return JSON.parse(readFileSync(SITE_INDEX_PATH, 'utf8')) as SiteIndex;
}

/**
 * Looks a target up in the run's index. A target the index does not know —
 * only possible if a page's DOM differs from what global setup saw — is
 * inspected once per worker and memoised.
 */
export function resolveTarget(
  url: string,
  fixtures: { request: APIRequestContext; context: BrowserContext },
): Promise<TargetInfo> {
  indexCache ??= loadIndex();
  const known = indexCache[url];
  if (known) return Promise.resolve(known);

  let pending = fallback.get(url);
  if (!pending) {
    pending = (async () => {
      const page = await fixtures.context.newPage();
      try {
        return await inspectTarget(fixtures.request, page, url);
      } finally {
        await page.close();
      }
    })();
    fallback.set(url, pending);
  }
  return pending;
}
