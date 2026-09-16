import { z } from 'astro/zod';

import { localizedOptional } from './shared';

/**
 * Publications — language-neutral.
 * OWNER: the Publications work unit.
 *
 * One record per work, facts from Crossref (the YAML names the source of
 * each). The page lists the records by year; the same records become
 * `publications.bib`.
 */

/** Celine as she appears in an author list. The page sets this in bold. */
export const SELF_AUTHOR = 'Bencker, C.';

export interface Author {
  family: string;
  /** "U. S.", "A.-R." */
  initials: string;
}

const FAMILY = /^\p{L}[\p{L}' -]*$/u;
const INITIALS = /^\p{Lu}\.(?:[ -]\p{Lu}\.)*$/u;

/** An author list in APA style: "Roth, L. H. O., Bencker, C., & Laireiter, A.-R." */
export function formatAuthors(authors: Author[]): string {
  const names = authors.map((a) => `${a.family}, ${a.initials}`);
  return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')}, & ${names.at(-1)}`;
}

/**
 * Splits an APA author list into names. Returns null unless the text is
 * exactly what `formatAuthors` writes, so a typo in the YAML fails the build
 * instead of producing a broken name in the BibTeX file.
 */
export function parseAuthors(text: string): Author[] | null {
  const tokens = text.replace(/,? & /, ', ').split(', ');
  if (tokens.length % 2 !== 0) return null;
  const authors: Author[] = [];
  for (let i = 0; i < tokens.length; i += 2) {
    const family = tokens[i]!;
    const initials = tokens[i + 1]!;
    if (!FAMILY.test(family) || !INITIALS.test(initials)) return null;
    authors.push({ family, initials });
  }
  return formatAuthors(authors) === text ? authors : null;
}

const isSelf = (author: Author) => `${author.family}, ${author.initials}` === SELF_AUTHOR;

export const publicationsSchema = z
  .object({
    /** Also the BibTeX citation key: first author, year, first word of the title. */
    id: z.string().regex(/^[a-z][a-z0-9-]*$/, 'Use a–z, 0–9 and hyphens.'),
    year: z.number().int(),
    /** Month of the issue, or of online publication; orders works within a year. */
    month: z.number().int().min(1).max(12).optional(),
    /** Rendered verbatim — publication titles stay in their own language. */
    title: z.string().min(1),
    /** Every author, in APA style: "Bencker, C., Tran, U. S., & Nater, U. M." */
    authors: z.string().min(1),
    /** The journal, as Crossref names it. */
    venue: z.string().optional(),
    volume: z.string().optional(),
    issue: z.string().optional(),
    /** A page range ("1–11") or an article number ("101160"). */
    pages: z.string().optional(),
    /** Without the resolver: "10.1192/bjp.2025.10311". */
    doi: z
      .string()
      .regex(/^10\.\d{4,9}\/\S+$/, 'Write the bare DOI, e.g. 10.1192/bjp.2025.10311.')
      .optional(),
    url: z.url().optional(),
    pdf: z.string().optional(),
    /** Marks first authorship. Must agree with `authors`. */
    firstAuthor: z.boolean().default(false),
    kind: z.enum(['peer-review', 'preprint', 'talk']).default('peer-review'),
    /** The optional "Kurz gesagt" callout. Only on selected works. */
    summaryPlain: localizedOptional.optional(),
  })
  .strict()
  .superRefine((work, ctx) => {
    const authors = parseAuthors(work.authors);
    if (!authors) {
      ctx.addIssue({
        code: 'custom',
        path: ['authors'],
        message:
          'Write each author as "Family, I. I.", separated by ", ", with ", & " before the last.',
      });
      return;
    }
    if (authors.filter(isSelf).length !== 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['authors'],
        message: `The author list must name "${SELF_AUTHOR}" exactly once.`,
      });
    }
    const first = authors[0]!;
    if (work.firstAuthor !== isSelf(first)) {
      ctx.addIssue({
        code: 'custom',
        path: ['firstAuthor'],
        message: `firstAuthor must be ${isSelf(first)}: the list starts with "${first.family}".`,
      });
    }
    if (work.kind === 'peer-review') {
      for (const key of ['venue', 'doi'] as const) {
        if (!work[key]) {
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: `A journal article needs \`${key}\`.`,
          });
        }
      }
    }
  });

export type Publication = z.infer<typeof publicationsSchema>;
