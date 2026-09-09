import { getCollection, type CollectionEntry } from 'astro:content';
import { getRelativeLocaleUrl } from 'astro:i18n';

import { LOCALES, otherLocale, isLocale, type Locale } from './config';

export type PageEntry = CollectionEntry<'pages'>;

/**
 * Content is addressed by (locale, variant). Only `standard` is built today;
 * "Einfach erklärt" becomes a second member here once the design canvas shows
 * whether it is a separate page or a section within one. Adding it is a new
 * collection plus a branch in `loadPages()` — not a change to callers.
 */
export type PageVariant = 'standard';

export interface ResolvedPage {
  entry: PageEntry;
  locale: Locale;
  /** Path segment after the locale. Empty string for the locale home page. */
  slug: string;
  translationKey: string;
}

/**
 * Locale and slug come from the file path, not frontmatter:
 * `src/content/pages/de/forschung.md` -> locale `de`, slug `forschung`.
 * `index.md` is the locale home page.
 */
function parseEntryId(id: string): { locale: Locale; slug: string } | null {
  const [maybeLocale, ...rest] = id.split('/');
  if (!isLocale(maybeLocale)) return null;
  const tail = rest.join('/');
  return { locale: maybeLocale, slug: tail === 'index' ? '' : tail };
}

export async function loadPages(): Promise<ResolvedPage[]> {
  const entries = await getCollection('pages', ({ data }) =>
    import.meta.env.PROD ? !data.draft : true,
  );

  return entries.flatMap((entry) => {
    const parsed = parseEntryId(entry.id);
    if (!parsed) {
      throw new Error(
        `Content file "src/content/pages/${entry.id}.md" is not inside a locale folder. ` +
          `Expected one of: ${LOCALES.join(', ')}.`,
      );
    }
    return [{ entry, ...parsed, translationKey: entry.data.translationKey }];
  });
}

export function pageHref(page: Pick<ResolvedPage, 'locale' | 'slug'>): string {
  return getRelativeLocaleUrl(page.locale, page.slug);
}

/**
 * The counterpart of a page in the other language, or null when it does not
 * exist. The switcher renders a disabled control for null rather than a dead
 * link or a redirect to the home page — losing the reader's place is worse
 * than showing an unavailable option.
 */
export function findCounterpart(page: ResolvedPage, all: ResolvedPage[]): ResolvedPage | null {
  const target = otherLocale(page.locale);
  return all.find((p) => p.locale === target && p.translationKey === page.translationKey) ?? null;
}

/**
 * Every page must exist in both languages unless it declares `singleLocale`.
 * Called from `getStaticPaths`, so a missing translation fails `astro build`
 * instead of surfacing later as a disabled switcher nobody noticed.
 */
export function assertTranslationsComplete(all: ResolvedPage[]): void {
  const problems: string[] = [];

  for (const page of all) {
    if (page.entry.data.singleLocale) continue;
    if (findCounterpart(page, all)) continue;
    problems.push(
      `  - "${page.entry.id}.md" (translationKey: "${page.translationKey}") has no ` +
        `${otherLocale(page.locale)} counterpart.`,
    );
  }

  const keys = new Map<string, ResolvedPage[]>();
  for (const page of all) {
    const bucket = keys.get(`${page.locale}:${page.translationKey}`) ?? [];
    bucket.push(page);
    keys.set(`${page.locale}:${page.translationKey}`, bucket);
  }
  for (const [key, bucket] of keys) {
    if (bucket.length > 1) {
      problems.push(
        `  - translationKey "${key.split(':')[1]}" is used by ${bucket.length} ` +
          `pages in the same locale: ${bucket.map((p) => p.entry.id).join(', ')}.`,
      );
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `Translation check failed:\n${problems.join('\n')}\n\n` +
        `Add the missing translation, or set "singleLocale: true" in the page's ` +
        `frontmatter if it is intentionally one-language only. ` +
        `See docs/i18n-policy.md.`,
    );
  }
}

export async function navigationFor(locale: Locale, all: ResolvedPage[]): Promise<ResolvedPage[]> {
  return all
    .filter((p) => p.locale === locale && p.entry.data.navOrder !== undefined)
    .sort((a, b) => (a.entry.data.navOrder ?? 0) - (b.entry.data.navOrder ?? 0));
}
