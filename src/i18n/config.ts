/**
 * Locale definitions — the single source of truth for which languages exist.
 *
 * Imported by `astro.config.mjs`, so it must stay free of Astro-only imports
 * (`astro:content`, `astro:i18n`) which are unavailable during config load.
 */

export const LOCALES = ['de', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

/**
 * German is the default: Betroffene and österreichische Redaktionen have the
 * highest claim to being understood, and they read German. English is fully
 * parallel for Komitees and Forschende, who tolerate Fachdeutsch better than
 * laypeople tolerate English.
 */
export const DEFAULT_LOCALE = 'de' satisfies Locale;

/** Language names, each written in its own language. */
export const LOCALE_LABELS: Record<Locale, string> = {
  de: 'Deutsch',
  en: 'English',
};

/** Value for the `lang` attribute and `hreflang` annotations. */
export const LOCALE_HTML_LANG: Record<Locale, string> = {
  de: 'de',
  en: 'en',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** The other locale — only meaningful while exactly two exist. */
export function otherLocale(locale: Locale): Locale {
  return locale === 'de' ? 'en' : 'de';
}
