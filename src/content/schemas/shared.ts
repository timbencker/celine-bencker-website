import { z } from 'astro/zod';

/** Text that must exist in both languages. */
export const localized = z.object({ de: z.string().min(1), en: z.string().min(1) }).strict();

/** Text that may exist in either language, or neither. */
export const localizedOptional = z
  .object({ de: z.string().optional(), en: z.string().optional() })
  .strict();

/** A link to another page, named by its translationKey so it survives slug changes. */
export const pageLink = z.object({ to: z.string().min(1), label: z.string().min(1) }).strict();
