/**
 * The period column of a CV row, from dates at ORCID's precision
 * (`2019`, `2022-10`, `2023-10-01`).
 *
 * - A year stays a year; a month shows as `10/2023`. Days are kept in the data
 *   but not shown — a CV counts in months.
 * - `start`–`end` is a range, collapsed when both read the same.
 * - Without `end` it is still running: "seit 2023" / "since 2023". A range
 *   with an end date in the future is shown as the range, so the row stays
 *   right after that date without a rebuild.
 * - Without `start` (a placeholder) it is a dash.
 */
export interface Period {
  start?: string;
  end?: string;
}

function show(date: string): string {
  const [year, month] = date.split('-');
  return month ? `${month}/${year}` : year!;
}

export function formatPeriod({ start, end }: Period, since: string): string {
  if (!start) return '—';
  if (!end) return `${since} ${show(start)}`;
  const from = show(start);
  const to = show(end);
  return from === to ? from : `${from}–${to}`;
}

/** A range of plain years, as the peer-review row shows it: `2022–2025`. */
export function formatYears(years: number[]): string {
  const from = Math.min(...years);
  const to = Math.max(...years);
  return from === to ? String(from) : `${from}–${to}`;
}
