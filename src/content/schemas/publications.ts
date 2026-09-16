import { z } from 'astro/zod';

import { localizedOptional } from './shared';

/**
 * Publications — language-neutral.
 * OWNER: the Publications work unit.
 */
export const publicationsSchema = z
  .object({
    id: z.string().min(1),
    year: z.number().int(),
    /** Rendered verbatim — publication titles stay in their own language. */
    title: z.string().min(1),
    authors: z.string().min(1),
    venue: z.string().optional(),
    doi: z.string().optional(),
    url: z.url().optional(),
    pdf: z.string().optional(),
    /** Marks first authorship, which the design sets in bold. */
    firstAuthor: z.boolean().default(false),
    kind: z.enum(['peer-review', 'preprint', 'talk']).default('peer-review'),
    /** The optional "Kurz gesagt" callout. Only on selected works. */
    summaryPlain: localizedOptional.optional(),
  })
  .strict();
