import { z } from 'astro/zod';

import { verifiedDoi } from '../research';

/**
 * Frontmatter block for Research (board 10b) — the page's own copy, one per
 * language. The research lines themselves (texts, terms, papers, the study)
 * are records in `src/content/data/research.yaml`.
 */
const text = z.string().min(1);

export const researchBlock = z
  .object({
    /** The page title: the research question. */
    question: text,
    /** The register toggle in the header. */
    register: z
      .object({
        /** Names the radio group, and sits above it. */
        label: text,
        expert: text,
        plain: text,
        /** Shown under the toggle in the plain register only. */
        motto: text,
      })
      .strict(),
    /** Labels inside the study's cycle graphic. */
    graphic: z
      .object({
        start: text,
        ovulation: text,
        end: text,
        estradiol: text,
        progesterone: text,
      })
      .strict(),
    methods: z
      .object({
        heading: text,
        items: z
          .array(
            z
              .object({
                title: text,
                text: text,
                /** The paper that shows the method. */
                doi: verifiedDoi,
                /** Names the paper, as the board does ("BJPsych 2025"). */
                label: text,
              })
              .strict(),
          )
          .min(1),
      })
      .strict(),
    collaboration: z.object({ heading: text, text: text }).strict(),
  })
  .strict();
