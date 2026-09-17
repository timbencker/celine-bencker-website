import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

import { strictFile, type StrictFileOptions } from './content/loaders/strictFile';
import { cvSchema } from './content/schemas/cv';
import { mediaSchema } from './content/schemas/media';
import { newsSchema } from './content/schemas/news';
import { notFoundSchema } from './content/schemas/not-found';
import { pageSchema } from './content/schemas/page';
import { publicationsSchema } from './content/schemas/publications';
import { researchSchema } from './content/schemas/research';
import { siteSchema } from './content/schemas/site';
import { talksSchema } from './content/schemas/talks';

/**
 * The content contract — wiring only. Each schema lives in its own file under
 * `src/content/schemas/`, so pages can evolve independently.
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
 * silently ignored. The data files load through `strictFile`
 * (`src/content/loaders/strictFile.ts`): a YAML typo, a missing or duplicate
 * `id`, or an empty list fails the build too, naming the file. Only `media`
 * may be empty (`[]`) — its page shows a placeholder until the first entry.
 */

const data = (name: string, options?: StrictFileOptions) =>
  strictFile(`./src/content/data/${name}.yaml`, options);

export const collections = {
  pages: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
    schema: pageSchema,
  }),
  research: defineCollection({ loader: data('research'), schema: researchSchema }),
  publications: defineCollection({ loader: data('publications'), schema: publicationsSchema }),
  talks: defineCollection({ loader: data('talks'), schema: talksSchema }),
  media: defineCollection({ loader: data('media', { allowEmpty: true }), schema: mediaSchema }),
  cv: defineCollection({ loader: data('cv'), schema: cvSchema }),
  news: defineCollection({ loader: data('news'), schema: newsSchema }),
  notFound: defineCollection({ loader: data('not-found'), schema: notFoundSchema }),
  site: defineCollection({
    loader: glob({ pattern: '**/*.yaml', base: './src/content/data/site' }),
    schema: siteSchema,
  }),
};
