import { z } from 'astro/zod';

/**
 * Talks — language-neutral.
 * OWNER: the Talks & Media work unit.
 */
export const talksSchema = z
  .object({
    id: z.string().min(1),
    /** YAML reads `2026-10-14` as a date; upcoming vs past is derived at build time. */
    date: z.coerce.date(),
    title: z.string().min(1),
    venue: z.string().min(1),
    location: z.string().optional(),
    url: z.url().optional(),
  })
  .strict();
