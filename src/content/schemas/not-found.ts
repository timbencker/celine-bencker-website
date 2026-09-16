import { z } from 'astro/zod';

/**
 * Copy for the 404 page. It is not a routed content page, so it lives in its
 * own data file rather than under `pages/`.
 * OWNER: the 404 work unit. A placeholder shape until that page is built.
 */
export const notFoundSchema = z.object({ id: z.string().min(1) }).strict();
