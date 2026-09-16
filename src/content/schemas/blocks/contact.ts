import { z } from 'astro/zod';

/**
 * Frontmatter block for Contact (board 9b), including the Impressum section.
 * OWNER: the Contact work unit. Empty until that page is built.
 */
export const contactBlock = z.object({}).strict();
