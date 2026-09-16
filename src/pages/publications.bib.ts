import type { APIRoute } from 'astro';

import { publicationsBibtex } from '../components/publications/bibtex';

/**
 * `publications.bib` — every work on the Publications page as BibTeX,
 * generated at build time. The file name must match `BIBTEX_FILE`, which the
 * page links to.
 */
export const GET: APIRoute = async () => {
  const { text } = await publicationsBibtex();
  return new Response(text, {
    headers: { 'Content-Type': 'application/x-bibtex; charset=utf-8' },
  });
};
