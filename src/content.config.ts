import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * The content contract.
 *
 * Two kinds of content, per the brief § 6:
 *
 *   PER LOCALE — prose. Page bodies and any text that reads differently in
 *   German and English. One file per language under `src/content/pages/<locale>/`.
 *
 *   LANGUAGE-NEUTRAL — records. Publications, talks and media are maintained
 *   ONCE, not twice: a DOI, a date, a venue and a journal name do not translate.
 *   Where such a record does carry prose (a plain-language summary), that one
 *   field is localized rather than the whole record being duplicated.
 *
 * `.strict()` throughout, so a misspelled key fails the build instead of being
 * silently ignored.
 */

/** Text that must exist in both languages. */
const localized = z.object({ de: z.string().min(1), en: z.string().min(1) }).strict();

/** Text that may exist in either language, or neither. */
const localizedOptional = z
  .object({ de: z.string().optional(), en: z.string().optional() })
  .strict();

// --- Pages: per locale -----------------------------------------------------

/** A link to another page, named by its translationKey so it survives slug changes. */
const pageLink = z.object({ to: z.string().min(1), label: z.string().min(1) }).strict();

/**
 * The large heading in a page header. `lines` break only on desktop; on phones
 * the heading wraps naturally.
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

/** Home-only blocks. */
const home = z
  .object({
    /** Text links under the lead. Internal, with an arrow. */
    links: z.array(pageLink).max(2),
    researchHeading: z.string().min(1),
    /** The two "Ausgänge" — tiles at the bottom of Home. */
    exits: z
      .array(
        z
          .object({ to: z.string().min(1), title: z.string().min(1), meta: z.string().min(1) })
          .strict(),
      )
      .max(2),
  })
  .strict();

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
     * translation check does not fail the build for it. Every exception is
     * declared, never implied. See docs/i18n-policy.md.
     */
    singleLocale: z.boolean().default(false),

    /** Decorative page background. `shapes`/`achtziger` etc. are not built. */
    background: z.enum(['aus', 'verwoben']).default('aus'),

    /** Hue of the verwoben circle. Ignored when background is `aus`. */
    backgroundHue: z.enum(['gelb', 'salbei', 'sand', 'flieder']).default('gelb'),

    hero: hero.optional(),
    home: home.optional(),

    draft: z.boolean().default(false),
  })
  .strict()
  .superRefine((page, ctx) => {
    const isHome = page.translationKey === 'home';
    if (page.hero?.emphasis && !isHome) {
      ctx.addIssue({
        code: 'custom',
        path: ['hero', 'emphasis'],
        message: 'The serif emphasis word is reserved for Home.',
      });
    }
    if (page.home && !isHome) {
      ctx.addIssue({
        code: 'custom',
        path: ['home'],
        message: 'The `home` block only belongs on the Home page.',
      });
    }
  });

export type PageFrontmatter = z.infer<typeof pageSchema>;

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: pageSchema,
});

// --- Research lines: language-neutral records, localized prose --------------

const research = defineCollection({
  loader: file('./src/content/data/research.yaml'),
  schema: z
    .object({
      id: z.string().min(1),
      order: z.number().int().nonnegative(),
      title: localized,
      /** One sentence, shown under the title where the line is linked from Home. */
      teaser: localized,
      /** The specialist version — the toggle's "Fachlich" register. */
      text: localized,
      /**
       * The plain-language version — "Einfach erklärt".
       * German is the audience the brief names; English is optional.
       */
      textPlain: localizedOptional,
    })
    .strict(),
});

// --- Publications: language-neutral ----------------------------------------

const publications = defineCollection({
  loader: file('./src/content/data/publications.yaml'),
  schema: z
    .object({
      id: z.string().min(1),
      year: z.number().int(),
      /** Rendered verbatim — publication titles stay in their own language. */
      title: z.string().min(1),
      authors: z.string().min(1),
      venue: z.string().optional(),
      doi: z.string().optional(),
      url: z.url().optional(),
      pdf: z.string().optional(),
      /** Marks first authorship, which the design sets in bold. */
      firstAuthor: z.boolean().default(false),
      kind: z.enum(['peer-review', 'preprint', 'talk']).default('peer-review'),
      /** The optional "Kurz gesagt" callout. Only on selected works. */
      summaryPlain: localizedOptional.optional(),
    })
    .strict(),
});

// --- Talks and media: language-neutral --------------------------------------

const talks = defineCollection({
  loader: file('./src/content/data/talks.yaml'),
  schema: z
    .object({
      id: z.string().min(1),
      /** YAML reads `2026-10-14` as a date; upcoming vs past is derived at build time. */
      date: z.coerce.date(),
      title: z.string().min(1),
      venue: z.string().min(1),
      location: z.string().optional(),
      url: z.url().optional(),
    })
    .strict(),
});

const media = defineCollection({
  loader: file('./src/content/data/media.yaml'),
  schema: z
    .object({
      id: z.string().min(1),
      date: z.coerce.date(),
      outlet: z.string().min(1),
      title: z.string().min(1),
      url: z.url().optional(),
      format: z.enum(['podcast', 'print', 'tv', 'radio', 'online']).default('online'),
    })
    .strict(),
});

// --- News band (Home) -------------------------------------------------------

/**
 * The lilac band under the Home header. Static, at most four items, and the
 * whole row must fit on one line — the component fails the build past four.
 * This is not a news page: that was dropped for its upkeep cost.
 */
const news = defineCollection({
  loader: file('./src/content/data/news.yaml'),
  schema: z
    .object({
      id: z.string().min(1),
      order: z.number().int().nonnegative(),
      text: localized,
    })
    .strict(),
});

// --- Site-wide --------------------------------------------------------------

const site = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/data/site' }),
  schema: z
    .object({
      siteName: z.string().min(1),
      tagline: localized,
      email: z.email().optional(),
      orcid: z.string().optional(),
      affiliation: localized.optional(),
      /** External profiles, in display order. Only listed ones are shown. */
      profiles: z.array(z.object({ label: z.string().min(1), url: z.url() }).strict()).default([]),
      /** Designer credit in the footer. */
      credit: z.object({ label: localized, url: z.url().optional() }).strict().optional(),
    })
    .strict(),
});

export const collections = { pages, research, publications, talks, media, news, site };
