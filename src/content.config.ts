import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * The content contract.
 *
 * One schema, applied to every locale, so the German and English versions of a
 * page cannot drift apart structurally. `.strict()` means an unknown or
 * misspelled key fails the build rather than being silently ignored.
 *
 * Locale and slug are NOT frontmatter fields — they are derived from the file
 * path (`src/content/pages/<locale>/<slug>.md`). Renaming the file changes the
 * URL, which is one less thing to keep in sync by hand.
 */
const pageSchema = z
  .object({
    /**
     * Stable identifier shared by every language version of the same page.
     * This is what lets the language switcher find the counterpart when the
     * slugs differ (`/de/forschung` <-> `/en/research`).
     */
    translationKey: z.string().min(1),

    title: z.string().min(1),
    description: z.string().min(1),

    /** Position in the primary navigation. Omit to keep the page out of it. */
    navOrder: z.number().int().nonnegative().optional(),

    /**
     * Declares that this page is intentionally single-language, so the
     * translation-completeness check does not fail the build for it.
     * Every exception is declared here rather than implied — e.g. a
     * German-only Impressum, or an "Einfach erklärt" page with no English
     * counterpart.
     */
    singleLocale: z.boolean().default(false),

    /** Decorative page background. `shapes` and `achtziger` are not built yet. */
    background: z.enum(['aus', 'verwoben']).default('aus'),

    draft: z.boolean().default(false),
  })
  .strict();

export type PageFrontmatter = z.infer<typeof pageSchema>;

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: pageSchema,
});

/**
 * Site-wide values that are not page content (contact details, social links).
 * Structured data lives in YAML because YAML takes comments and JSON does not.
 */
const site = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/data/site' }),
  schema: z
    .object({
      siteName: z.string().min(1),
      tagline: z.string().min(1),
      email: z.email().optional(),
    })
    .strict(),
});

export const collections = { pages, site };
