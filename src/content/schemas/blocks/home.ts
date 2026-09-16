import { z } from 'astro/zod';

import { pageLink } from '../shared';

/** Frontmatter block for Home (board 6a). */
export const homeBlock = z
  .object({
    /** Text links under the lead. Internal, with an arrow. */
    links: z.array(pageLink).max(2),
    researchHeading: z.string().min(1),
    /** The two "Ausgänge" — tiles at the bottom of Home. */
    exits: z
      .array(
        z
          .object({ to: z.string().min(1), title: z.string().min(1), meta: z.string().min(1) })
          .strict(),
      )
      .max(2),
  })
  .strict();
