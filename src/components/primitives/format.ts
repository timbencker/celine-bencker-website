import type { Locale } from '../../i18n/config';

/**
 * "180 kB", "1,2 MB" — decimal units, as the boards write them. The caller
 * measures the file; components never read from disk.
 */
export function formatFileSize(bytes: number, locale: Locale): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    throw new Error(`File size must be a non-negative number of bytes, got ${bytes}.`);
  }
  const [value, unit, digits] =
    bytes < 1000
      ? [bytes, 'byte', 0]
      : bytes < 1_000_000
        ? [bytes / 1000, 'kilobyte', 0]
        : [bytes / 1_000_000, 'megabyte', 1];
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit,
    maximumFractionDigits: digits,
  }).format(value);
}

export interface DateParts {
  /** `YYYY-MM-DD`, for `<time datetime>`. */
  iso: string;
  /** "14" */
  day: string;
  /** "Okt 2026" / "Oct 2026" — the standalone month has no trailing dot in German. */
  monthYear: string;
  /** "14. Oktober 2026" / "October 14, 2026" — what a screen reader hears. */
  long: string;
}

/**
 * A calendar date split the way the talk rows show it. Dates from YAML are
 * midnight UTC, so every part is read in UTC — otherwise a build machine west
 * of Greenwich would print the day before.
 */
export function dateParts(date: Date, locale: Locale): DateParts {
  if (Number.isNaN(date.getTime())) {
    throw new Error('ListRow `date` received an invalid Date.');
  }
  const fmt = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' });

  const day =
    fmt({ day: 'numeric' })
      .formatToParts(date)
      .find((part) => part.type === 'day')?.value ?? String(date.getUTCDate());

  return {
    iso: date.toISOString().slice(0, 10),
    day,
    monthYear: `${fmt({ month: 'short' }).format(date)} ${fmt({ year: 'numeric' }).format(date)}`,
    long: fmt({ dateStyle: 'long' }).format(date),
  };
}
