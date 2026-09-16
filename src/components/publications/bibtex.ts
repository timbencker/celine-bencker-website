import { parseAuthors } from '../../content/schemas/publications';
import { getSite } from '../../lib/site';
import { loadPublications, type Work } from './data';

/**
 * `publications.bib`, generated from `src/content/data/publications.yaml`.
 *
 * The endpoint (`src/pages/publications.bib.ts`) serves this text and the
 * page measures the same text, so the size beside the link is the size of the
 * file a visitor downloads.
 */

/** Where the endpoint serves the file, below the site base. */
export const BIBTEX_FILE = 'publications.bib';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const LATEX_SPECIAL: Record<string, string> = {
  '\\': '\\textbackslash{}',
  '~': '\\textasciitilde{}',
  '^': '\\textasciicircum{}',
};

/** Escapes LaTeX's special characters. The file is UTF-8, so letters stay as they are. */
function escape(value: string): string {
  return value.replace(/[\\{}&%$#_~^]/g, (char) => LATEX_SPECIAL[char] ?? `\\${char}`);
}

function article(work: Work): string {
  const authors = parseAuthors(work.authors);
  if (!authors || !work.venue || !work.doi) {
    // The schema already requires all three; this keeps the file honest if it changes.
    throw new Error(`Publication "${work.id}" needs authors, venue and doi for BibTeX.`);
  }

  const fields: [string, string][] = [
    ['author', `{${authors.map((a) => `${escape(a.family)}, ${a.initials}`).join(' and ')}}`],
    // Double braces keep the title's capitals (ISSAC, BEAM) as written.
    ['title', `{{${escape(work.title)}}}`],
    ['journal', `{${escape(work.venue)}}`],
    ['year', `{${work.year}}`],
  ];
  // BibTeX's own month macros, unbraced.
  if (work.month) fields.push(['month', MONTHS[work.month - 1]!]);
  if (work.volume) fields.push(['volume', `{${escape(work.volume)}}`]);
  if (work.issue) fields.push(['number', `{${escape(work.issue)}}`]);
  if (work.pages) fields.push(['pages', `{${escape(work.pages.replace(/–/g, '--'))}}`]);
  // Verbatim: biblatex reads DOIs literally.
  fields.push(['doi', `{${work.doi}}`]);

  const width = Math.max(...fields.map(([key]) => key.length));
  const body = fields.map(([key, value]) => `  ${key.padEnd(width)} = ${value},`).join('\n');
  return `@article{${work.id},\n${body}\n}\n`;
}

export interface BibtexFile {
  text: string;
  /** Size in bytes as served (UTF-8). */
  bytes: number;
}

export async function publicationsBibtex(): Promise<BibtexFile> {
  const [site, works] = await Promise.all([getSite(), loadPublications()]);
  const text = [`% ${site.siteName} – publications\n`, ...works.map(article)].join('\n');
  return { text, bytes: new TextEncoder().encode(text).byteLength };
}
