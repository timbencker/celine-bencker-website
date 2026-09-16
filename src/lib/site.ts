import { getCollection, type CollectionEntry } from 'astro:content';

export type SiteData = CollectionEntry<'site'>['data'];

/** The one site-wide settings file. Fails the build if it is missing or doubled. */
export async function getSite(): Promise<SiteData> {
  const entries = await getCollection('site');
  if (entries.length !== 1) {
    throw new Error(
      `Expected exactly one file in src/content/data/site/, found ${entries.length}.`,
    );
  }
  return entries[0]!.data;
}
