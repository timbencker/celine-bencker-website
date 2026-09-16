import { z } from 'astro/zod';

import { localized, localizedOptional } from './shared';

/**
 * Research lines — language-neutral records with localized prose.
 * OWNER: the Research work unit. Home reads `id`, `order`, `title` and
 * `teaser`; those four must stay compatible.
 */
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
  })
  .strict();
