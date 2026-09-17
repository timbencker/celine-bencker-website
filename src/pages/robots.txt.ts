import type { APIRoute } from 'astro';

import { withBase } from '../i18n/urls';

/**
 * The sitemap lives under the base path (`/celine-bencker-website/`), not at
 * the host root — that belongs to timbencker.github.io, not to this site.
 */
export const GET: APIRoute = ({ site }) => {
  const path = withBase('sitemap.xml');
  const sitemap = site ? new URL(path, site).href : path;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
