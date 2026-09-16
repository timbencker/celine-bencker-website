/**
 * Interface strings — chrome only (navigation, buttons, labels).
 *
 * Page *content* never lives here; it lives in `src/content/`. This file exists
 * so that the handful of words the layout itself speaks are translated in one
 * place rather than scattered through components.
 *
 * German is authored first and English is typed as `Record<keyof typeof de, string>`,
 * so a key added to German but forgotten in English is a compile error.
 */

const de = {
  'skip.toContent': 'Zum Inhalt springen',
  'nav.primary': 'Hauptnavigation',
  'nav.home': 'Startseite',
  'nav.menuOpen': 'Menü',
  'nav.menuClose': 'Schließen',
  'lang.label': 'Sprache',
  'lang.switch': 'Auf Englisch ansehen',
  'lang.unavailable': 'Diese Seite gibt es noch nicht auf Englisch',
  'band.label': 'Aktuell',
  'link.newTab': '(öffnet in neuem Tab)',
  'link.download': 'Download',
  'callout.label': 'Kurz gesagt',
  'portrait.pending': 'Porträt folgt',
  'image.pending': 'Bild folgt',
  'footer.profiles': 'Profile',
  'footer.imprint': 'Impressum',
} as const;

const en: Record<keyof typeof de, string> = {
  'skip.toContent': 'Skip to content',
  'nav.primary': 'Main navigation',
  'nav.home': 'Home',
  'nav.menuOpen': 'Menu',
  'nav.menuClose': 'Close',
  'lang.label': 'Language',
  'lang.switch': 'View in German',
  'lang.unavailable': 'This page is not available in German yet',
  'band.label': 'Latest',
  'link.newTab': '(opens in a new tab)',
  'link.download': 'download',
  'callout.label': 'In short',
  'portrait.pending': 'Portrait to follow',
  'image.pending': 'Image to follow',
  'footer.profiles': 'Profiles',
  'footer.imprint': 'Imprint',
};

export type UIKey = keyof typeof de;

const DICTIONARIES = { de, en } as const;

export function t(locale: 'de' | 'en', key: UIKey): string {
  return DICTIONARIES[locale][key];
}
