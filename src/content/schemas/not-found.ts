import { z } from 'astro/zod';

/**
 * Copy for the 404 page (board 11a). It is not a routed content page, so it
 * lives in its own data file rather than under `pages/`.
 *
 * GitHub Pages serves one 404.html for every missing path, whatever its
 * language, so the page is German with one English paragraph: `de` holds the
 * German page copy, `en` that paragraph. Nothing on the page is shown in both
 * languages, so no field is `{ de, en }`.
 *
 * The "Weiter zu" titles and links come from the pages themselves; only the
 * one-line descriptions live here, keyed by translationKey. That the keys
 * match the navigation exactly is checked where the list is built
 * (`src/components/not-found/onward.ts`), because the navigation is not known
 * to this schema.
 */
const text = z.string().min(1);

export const notFoundSchema = z
  .object({
    id: z.literal('not-found'),
    de: z
      .object({
        /** The small error label above the title. */
        label: text,
        /** The page's h1 and document title. */
        title: text,
        /** Under the title; also the meta description. */
        intro: text,
        /** Visible text of the mail link for reporting a broken link. */
        report: text,
        onward: z
          .object({
            heading: text,
            /** One line per navigation page, keyed by its translationKey. */
            descriptions: z.record(text, text),
          })
          .strict(),
      })
      .strict(),
    en: z
      .object({
        /** The English paragraph, before its link. */
        text,
        /** Text of the link to the English home page. */
        link: text,
      })
      .strict(),
  })
  .strict();
