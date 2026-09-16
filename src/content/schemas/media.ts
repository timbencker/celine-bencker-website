import { z } from 'astro/zod';

/**
 * Media appearances — language-neutral.
 * OWNER: the Talks & Media work unit.
 */
export const mediaSchema = z
  .object({
    id: z.string().min(1),
    date: z.coerce.date(),
    outlet: z.string().min(1),
    title: z.string().min(1),
    url: z.url().optional(),
    format: z.enum(['podcast', 'print', 'tv', 'radio', 'online']).default('online'),
  })
  .strict();
