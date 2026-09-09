import type { APIRoute } from 'astro';

import { DEFAULT_LOCALE, LOCALE_HTML_LANG } from '../i18n/config';
import { findCounterpart, loadPages, pageHref, type ResolvedPage } from '../i18n/pages';

/**
 * Hand-written rather than using `@astrojs/sitemap`.
 *
 * That integration derives alternates by swapping the locale prefix, which
 * assumes both languages share a slug. Ours deliberately do not
 * (`/de/forschung` <-> `/en/research`), so it emitted no alternates for those
 * pages at all, duplicated hreflang values, and indexed the noindex root
 * redirect. Building from the same translationKey index the switcher uses keeps
 * the sitemap and the site telling the same story.
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('`site` must be set in astro.config.mjs to build a sitemap.');

  const all = await loadPages();
  const absolute = (page: ResolvedPage) => escapeXml(new URL(pageHref(page), site).href);

  const entries = all.map((page) => {
    const counterpart = findCounterpart(page, all);
    const versions = counterpart ? [page, counterpart] : [page];

    const links = versions.map(
      (v) =>
        `<xhtml:link rel="alternate" hreflang="${LOCALE_HTML_LANG[v.locale]}" href="${absolute(v)}"/>`,
    );

    // x-default points at the default-language version of this same page.
    const fallback = versions.find((v) => v.locale === DEFAULT_LOCALE) ?? page;
    links.push(`<xhtml:link rel="alternate" hreflang="x-default" href="${absolute(fallback)}"/>`);

    return `<url><loc>${absolute(page)}</loc>${links.join('')}</url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
