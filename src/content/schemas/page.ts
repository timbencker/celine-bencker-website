import { z } from 'astro/zod';

import { contactBlock } from './blocks/contact';
import { cvBlock } from './blocks/cv';
import { homeBlock } from './blocks/home';
import { publicationsBlock } from './blocks/publications';
import { researchBlock } from './blocks/research';
import { talksMediaBlock } from './blocks/talks-media';

/**
 * Frontmatter of every page, in every language.
 *
 * Page-specific content lives in one optional block per page, each defined in
 * its own file under `blocks/`. That keeps pages independent: changing what
 * Research needs never touches the file that describes Contact.
 */

/**
 * The large heading in a page header. `lines` are forced line breaks from
 * tablet on Home and from desktop on Talks & Media (see their views); below
 * that the heading wraps naturally.
 */
const hero = z
  .object({
    lines: z.array(z.string().min(1)).min(1),
    /**
     * The one word set in Instrument Serif Italic. The design allows exactly
     * one such word on the whole site, and only on Home — enforced below.
     */
    emphasis: z.string().regex(/^\S+$/, 'emphasis must be a single word').optional(),
    lead: z.string().min(1).optional(),
  })
  .strict();

/** Which page each block belongs to, by translationKey. */
const BLOCK_OWNER = {
  home: 'home',
  research: 'research',
  publications: 'publications',
  cv: 'cv',
  talksMedia: 'talks-media',
  contact: 'contact',
} as const;

export const pageSchema = z
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
     * translation check does not fail the build for it. Every exception is
     * declared, never implied. See docs/i18n-policy.md.
     */
    singleLocale: z.boolean().default(false),

    /** Decorative page background. `shapes`/`achtziger` etc. are not built. */
    background: z.enum(['aus', 'verwoben']).default('aus'),

    /** Hue of the verwoben circle. Ignored when background is `aus`. */
    backgroundHue: z.enum(['gelb', 'salbei', 'sand', 'flieder']).default('gelb'),

    hero: hero.optional(),

    home: homeBlock.optional(),
    research: researchBlock.optional(),
    publications: publicationsBlock.optional(),
    cv: cvBlock.optional(),
    talksMedia: talksMediaBlock.optional(),
    contact: contactBlock.optional(),

    draft: z.boolean().default(false),
  })
  .strict()
  .superRefine((page, ctx) => {
    if (page.hero?.emphasis && page.translationKey !== 'home') {
      ctx.addIssue({
        code: 'custom',
        path: ['hero', 'emphasis'],
        message: 'The serif emphasis word is reserved for Home.',
      });
    }
    for (const [key, owner] of Object.entries(BLOCK_OWNER)) {
      if (page[key as keyof typeof BLOCK_OWNER] !== undefined && page.translationKey !== owner) {
        ctx.addIssue({
          code: 'custom',
          path: [key],
          message: `The \`${key}\` block only belongs on the page with translationKey "${owner}".`,
        });
      }
    }
  });

export type PageFrontmatter = z.infer<typeof pageSchema>;
