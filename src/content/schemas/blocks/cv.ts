import { z } from 'astro/zod';

/**
 * Frontmatter block for CV (board 7b).
 * OWNER: the CV work unit. Empty until that page is built.
 */
export const cvBlock = z.object({}).strict();
