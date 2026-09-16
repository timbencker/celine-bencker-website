import { z } from 'astro/zod';

import { localized } from './shared';

/**
 * The lilac band under the Home header. Static, at most four items, and the
 * whole row must fit on one line — the Band component fails the build past
 * four. This is not a news page: that was dropped for its upkeep cost.
 */
export const newsSchema = z
  .object({
    id: z.string().min(1),
    order: z.number().int().nonnegative(),
    text: localized,
  })
  .strict();
