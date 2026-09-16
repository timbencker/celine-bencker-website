import { pageHref, type ResolvedPage } from '../../i18n/pages';

export interface OnwardRow {
  href: string;
  title: string;
  sub: string;
}

/**
 * The 404's "Weiter zu" list: one row per navigation page, in navigation
 * order. Title and link come from the page, so a renamed page or slug never
 * breaks the list; the one-line description comes from `not-found.yaml`,
 * keyed by translationKey.
 *
 * The keys must match the navigation exactly. A nav page without a
 * description would ship a row without its sentence, and a description for a
 * page that is not in the navigation is a typo or a leftover — both fail the
 * build, like every other misspelled key on this site.
 */
export function onwardRows(nav: ResolvedPage[], descriptions: Record<string, string>): OnwardRow[] {
  const keys = new Set(nav.map((page) => page.translationKey));
  const missing = [...keys].filter((key) => !Object.hasOwn(descriptions, key));
  const unknown = Object.keys(descriptions).filter((key) => !keys.has(key));

  if (missing.length > 0 || unknown.length > 0) {
    const lines = [
      ...missing.map((key) => `  - "${key}" is in the navigation but has no description.`),
      ...unknown.map((key) => `  - "${key}" has a description but is not in the navigation.`),
    ];
    throw new Error(
      `src/content/data/not-found.yaml, de.onward.descriptions:\n${lines.join('\n')}\n` +
        `Keys are translationKeys of the navigation pages: ${[...keys].join(', ')}.`,
    );
  }

  return nav.map((page) => ({
    href: pageHref(page),
    title: page.entry.data.title,
    sub: descriptions[page.translationKey]!,
  }));
}
