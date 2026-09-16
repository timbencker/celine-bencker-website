import { getCollection, type CollectionEntry } from 'astro:content';

export type Work = CollectionEntry<'publications'>['data'];

export interface YearGroup {
  year: number;
  works: Work[];
}

/**
 * Every work the page and the BibTeX file list, newest first: by year, then
 * month, then title.
 *
 * Board 7a lists journal articles. Talks belong on Talks & Media, and a
 * preprint with a published version is not listed, so any other kind stops
 * the build instead of disappearing without notice.
 */
export async function loadPublications(): Promise<Work[]> {
  const works = (await getCollection('publications')).map((entry) => entry.data);

  const other = works.filter((work) => work.kind !== 'peer-review');
  if (other.length > 0) {
    throw new Error(
      `src/content/data/publications.yaml: the Publications page lists journal articles only, ` +
        `but ${other.map((w) => `"${w.id}" is ${w.kind}`).join(', ')}. ` +
        `Talks belong in talks.yaml; a preprint whose published version is listed is left out.`,
    );
  }

  return works.sort(
    (a, b) =>
      b.year - a.year || (b.month ?? 0) - (a.month ?? 0) || a.title.localeCompare(b.title, 'en'),
  );
}

/** Groups works that are already sorted newest first. */
export function groupByYear(works: Work[]): YearGroup[] {
  const groups: YearGroup[] = [];
  for (const work of works) {
    const last = groups.at(-1);
    if (last?.year === work.year) last.works.push(work);
    else groups.push({ year: work.year, works: [work] });
  }
  return groups;
}
