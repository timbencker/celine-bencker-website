import type { Locale } from '../../i18n/config';
import { dateParts } from '../primitives/format';

/** A date as precise as its source — the parsed form of `partialDate` in the talks schema. */
export interface PartialDate {
  year: number;
  month?: number | undefined;
  day?: number | undefined;
}

const utc = (year: number, monthIndex: number, day: number) =>
  new Date(Date.UTC(year, monthIndex, day));

/** Midnight UTC of the first day the date can mean. */
function firstDay({ year, month, day }: PartialDate): Date {
  return utc(year, (month ?? 1) - 1, day ?? 1);
}

/** Midnight UTC of the last day the date can mean ("2025-08" → 31 August). */
function lastDay({ year, month, day }: PartialDate): Date {
  if (month === undefined) return utc(year, 11, 31);
  if (day === undefined) return utc(year, month, 0);
  return utc(year, month - 1, day);
}

/**
 * Whether a talk still lies ahead on `today` (the build date). A date known
 * only to the month or year counts as upcoming until that period is over, so
 * a talk "in October" stays listed through October.
 */
export function isUpcoming(date: PartialDate, today: Date): boolean {
  const startOfToday = utc(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return lastDay(date).getTime() >= startOfToday.getTime();
}

/** Oldest first; for one start, the less precise date first. */
export function compareDates(a: PartialDate, b: PartialDate): number {
  return (
    firstDay(a).getTime() - firstDay(b).getTime() || lastDay(b).getTime() - lastDay(a).getTime()
  );
}

export interface DateLabel {
  /** For `<time datetime>`: `2025`, `2025-08` or `2025-08-05` — all valid HTML dates. */
  iso: string;
  /** The large part of a talk row: the day, else the month, else the year. */
  large: string;
  /** Beside it: "Aug 2025" for a day, "2025" for a month, nothing for a year. */
  small?: string;
  /** What a screen reader hears: "5. August 2025", "August 2025", "2025". */
  long: string;
  /** For a meta line: "Aug 2025", or "2025" for a year. */
  short: string;
}

/**
 * The parts of a date a row shows, never more than the source knows. A full
 * day is split exactly as ListRow `date` splits it.
 */
export function describeDate(date: PartialDate, locale: Locale): DateLabel {
  const at = firstDay(date);
  const fmt = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(at);
  const year = fmt({ year: 'numeric' });
  const yyyy = String(date.year).padStart(4, '0');

  if (date.month !== undefined && date.day !== undefined) {
    const parts = dateParts(at, locale);
    return {
      iso: parts.iso,
      large: parts.day,
      small: parts.monthYear,
      long: parts.long,
      short: parts.monthYear,
    };
  }
  if (date.month !== undefined) {
    // The standalone short month ("Aug", "Juli") — no trailing dot in German.
    const month = fmt({ month: 'short' });
    return {
      iso: `${yyyy}-${String(date.month).padStart(2, '0')}`,
      large: month,
      small: year,
      long: fmt({ month: 'long', year: 'numeric' }),
      short: `${month} ${year}`,
    };
  }
  return { iso: yyyy, large: year, long: year, short: year };
}
