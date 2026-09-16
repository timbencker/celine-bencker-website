import type { Page } from '@playwright/test';

import { BASE_PATH, LOCAL_ORIGIN } from './site';

/**
 * When a page declares no icon, Chrome requests `/favicon.ico` at the host
 * root on its own, at a moment the page does not control — so the resulting
 * 404 shows up in some runs and not in others. Under a base path that URL is
 * not even part of this site. The probe is ignored here; the missing icon
 * declaration is asserted deterministically in site.spec.ts instead.
 */
const BROWSER_FAVICON_PROBE = BASE_PATH === '/' ? null : `${LOCAL_ORIGIN}/favicon.ico`;

/**
 * Collects console errors and uncaught exceptions for the page's lifetime.
 * Attach before navigating.
 */
export function collectPageErrors(page: Page, options: { expectDocumentStatus?: number } = {}) {
  const errors: string[] = [];

  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const { url, lineNumber } = message.location();
    if (url && url === BROWSER_FAVICON_PROBE) return;
    // A 404 page is supposed to answer 404; Chrome logs that for the document itself.
    if (
      options.expectDocumentStatus &&
      url === page.url() &&
      message.text().includes(`status of ${options.expectDocumentStatus}`)
    ) {
      return;
    }
    errors.push(`console.error: ${message.text()}${url ? ` (${url}:${lineNumber})` : ''}`);
  });
  page.on('pageerror', (error) => errors.push(`uncaught: ${error.message}`));

  return errors;
}
