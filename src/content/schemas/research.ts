import { z } from 'astro/zod';

import { localized, localizedOptional } from './shared';

/**
 * Research lines — language-neutral records with localized prose.
 * OWNER: the Research work unit. Home reads `id`, `order`, `title` and
 * `teaser`; those four must stay compatible.
 *
 * The Research page (board 10b) shows every line in two registers: `text` is
 * the specialist version, `textPlain` the plain-language one. A line without
 * plain text in a language shows its specialist text in both registers.
 */

/**
 * The DOIs this site may link, each confirmed by Celine's ORCID record and its
 * Crossref metadata (design/sources/). A DOI outside this list fails the build,
 * so an unverified paper cannot slip onto the page.
 */
export const VERIFIED_DOIS = [
  /** ISSAC study protocol — BMJ Open 16(9), 2026. */
  '10.1136/bmjopen-2026-123210',
  /** Systematic review and multilevel meta-analyses — British Journal of Psychiatry, 2025. */
  '10.1192/bjp.2025.10311',
  /** Progestagens review — Frontiers in Neuroendocrinology 76, 2025. */
  '10.1016/j.yfrne.2024.101160',
  /** Broaden-and-build network analysis — Frontiers in Psychology 15, 2024. */
  '10.3389/fpsyg.2024.1405272',
] as const;

export type VerifiedDoi = (typeof VERIFIED_DOIS)[number];

export const verifiedDoi = z.enum(VERIFIED_DOIS);

export function doiUrl(doi: VerifiedDoi): string {
  return `https://doi.org/${doi}`;
}

/** A paper under a line. The label names the venue, as the board does. */
const paper = z.object({ doi: verifiedDoi, label: localized }).strict();

/** `ui-Term`: a term in bold, then its definition. */
const termEntry = z.object({ term: z.string().min(1), definition: z.string().min(1) }).strict();

/** The line that is a study: the `framed` block on the page. */
const study = z
  .object({
    /** Shown under the line title, before the status. */
    name: localized,
    status: localized,
    /** Label and value pairs beside the cycle graphic — at most three, as on the board. */
    facts: z
      .array(z.object({ label: localized, value: localized }).strict())
      .max(3)
      .default([]),
    /** Caption under the cycle graphic. */
    caption: localized,
    /**
     * The page's one pill button. Rendered only with a real address — a
     * sign-up form or study page that exists.
     */
    participate: z.object({ label: localized, href: z.url() }).strict().optional(),
  })
  .strict();

export const researchSchema = z
  .object({
    id: z.string().min(1),
    order: z.number().int().nonnegative(),
    title: localized,
    /** One sentence, shown under the title where the line is linked from Home. */
    teaser: localized,
    /** The specialist version — the toggle's "Fachlich" register. */
    text: localized,
    /**
     * The plain-language version — "Einfach erklärt".
     * German is the audience the brief names; English is optional.
     */
    textPlain: localizedOptional,
    papers: z.array(paper).default([]),
    /** Definition shown with the specialist text. Needs both languages. */
    term: z.object({ de: termEntry, en: termEntry }).strict().optional(),
    /** Definition shown with the plain text instead. Either language may be missing. */
    termPlain: z.object({ de: termEntry.optional(), en: termEntry.optional() }).strict().optional(),
    study: study.optional(),
  })
  .strict();
