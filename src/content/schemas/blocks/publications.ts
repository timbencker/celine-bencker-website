import { z } from 'astro/zod';

/**
 * Frontmatter block for Publications (board 7a). The works themselves are
 * language-neutral records in `src/content/data/publications.yaml`; this block
 * holds only the words around them.
 */
export const publicationsBlock = z
  .object({
    /** The download beside the title: "BibTeX ↓ (.bib, 4 kB)". */
    bibtex: z.object({ label: z.string().min(1), format: z.string().min(1) }).strict(),
    /**
     * The group above the years for manuscripts under review or in
     * preparation. Omit it to show no such group.
     */
    submitted: z
      .object({
        heading: z.string().min(1),
        items: z
          .array(
            z
              .object({
                title: z.string().min(1),
                /** Role and type of work: "Erstautorin · Empirische Arbeit". */
                sub: z.string().min(1).optional(),
                /** Where it stands, in the DOI link's place: "in Begutachtung". */
                status: z.string().min(1),
              })
              .strict(),
          )
          .min(1),
      })
      .strict()
      .optional(),
  })
  .strict();
