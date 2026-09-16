import { z } from 'astro/zod';

/**
 * CV entries.
 * OWNER: the CV work unit. A placeholder shape until that page is built.
 */
export const cvSchema = z.object({ id: z.string().min(1) }).strict();
