import { z } from 'astro/zod';

import { LOCALES } from '../../i18n/config';

const PARTIAL_DATE = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;

/**
 * A date only as precise as its source: `'2025'`, `'2025-08'` or
 * `'2025-08-05'`. ORCID often records no day, and a talk list must not invent
 * one, so the day and the month are optional.
 *
 * Unquoted, YAML reads the full form as a Date and a bare year as a number;
 * both are accepted. The value is parsed into its parts. Upcoming vs past is
 * derived from them at build time (`src/components/talks-media/partialDate.ts`),
 * and the page shows only the parts that exist.
 */
export const partialDate = z.preprocess(
  (value) =>
    value instanceof Date && !Number.isNaN(value.getTime())
      ? value.toISOString().slice(0, 10)
      : typeof value === 'number'
        ? String(value)
        : value,
  z
    .string()
    .regex(PARTIAL_DATE, 'Write the date as YYYY, YYYY-MM or YYYY-MM-DD.')
    .transform((value, ctx) => {
      const [, y, m, d] = PARTIAL_DATE.exec(value) ?? [];
      const year = Number(y);
      const month = m === undefined ? undefined : Number(m);
      const day = d === undefined ? undefined : Number(d);

      if (month !== undefined && (month < 1 || month > 12)) {
        ctx.addIssue({ code: 'custom', message: `"${value}" has no month ${m}.` });
        return z.NEVER;
      }
      if (month !== undefined && day !== undefined) {
        const check = new Date(Date.UTC(year, month - 1, day));
        if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
          ctx.addIssue({ code: 'custom', message: `"${value}" is not a calendar day.` });
          return z.NEVER;
        }
      }
      return { year, month, day };
    }),
);

/** What kind of contribution a talk entry is. The page block names each one. */
export const talkFormat = z.enum([
  'conference-presentation',
  'conference-poster',
  'public-talk',
  'abstract',
]);

/**
 * Talks and conference contributions — language-neutral: one record for both
 * languages.
 * OWNER: the Talks & Media work unit.
 */
export const talksSchema = z
  .object({
    id: z.string().min(1),
    date: partialDate,
    title: z.string().min(1),
    /** Language of the title, so a screen reader pronounces it correctly. */
    lang: z.enum(LOCALES),
    venue: z.string().min(1),
    location: z.string().min(1).optional(),
    format: talkFormat,
    /** The record of the contribution (u:cris, DOI, programme). Omit if none. */
    url: z.url().optional(),
  })
  .strict();
