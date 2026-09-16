import { statSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

import type { Locale } from '../../i18n/config';
import { withBase } from '../../i18n/urls';

/**
 * The CV as a PDF, one per language: `public/cv-de.pdf`, `public/cv-en.pdf`.
 *
 * Measured when the page is built, so the controls appear with their real
 * size as soon as a file is added, and not at all while it is missing — a
 * download link without a file is a dead link (plan rule 12). Builds run from
 * the project root, which is where `public/` is looked up.
 */
export interface CvPdf {
  locale: Locale;
  href: string;
  bytes: number;
}

export function cvPdf(locale: Locale): CvPdf | null {
  const file = `cv-${locale}.pdf`;
  const stats = statSync(join(cwd(), 'public', file), { throwIfNoEntry: false });
  if (!stats?.isFile()) return null;
  return { locale, href: withBase(file), bytes: stats.size };
}
