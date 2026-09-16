import { z } from 'astro/zod';

import { localized } from './shared';

/**
 * CV entries — the facts on the CV page (board 7b).
 * OWNER: the CV work unit.
 *
 * Only what a verified source confirms (Celine's public ORCID record); the
 * rest is a placeholder until Celine fills it in. Publications are not kept
 * here: the page derives them from the `publications` collection.
 *
 * Two shapes, told apart by `section`:
 * - an entry (education, positions, funding, talks, teaching, service): a
 *   period and "title, detail";
 * - a peer-review record (`section: review`): one journal and the year of
 *   each review. The page sums them into one row under "Service".
 */

/**
 * A date at the precision ORCID gives it: `2019`, `2022-10` or `2023-10-01`.
 * YAML reads an unquoted `2019` as a number and `2023-10-01` as a date; both
 * are turned back into this form.
 */
const orcidDate = z.preprocess(
  (value) =>
    typeof value === 'number'
      ? String(value)
      : value instanceof Date
        ? value.toISOString().slice(0, 10)
        : value,
  z
    .string()
    .regex(
      /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/,
      'Use the precision ORCID gives: YYYY, YYYY-MM or YYYY-MM-DD.',
    ),
);

const PLACEHOLDER_PREFIX = { de: 'PLATZHALTER', en: 'PLACEHOLDER' } as const;

const entry = z
  .object({
    id: z.string().min(1),
    section: z.enum(['education', 'positions', 'funding', 'talks', 'teaching', 'service']),
    /** Position inside the section, ascending. */
    order: z.number().int(),
    start: orcidDate.optional(),
    /** Omit while it is still running; the page then writes "seit …". */
    end: orcidDate.optional(),
    /** Bold: the degree, role or award. */
    title: localized,
    /** After a comma: department, institution, place. */
    detail: localized.optional(),
    /**
     * Not confirmed by a source. Required for every `PLATZHALTER – …` row;
     * the page sets these rows apart in grey.
     */
    placeholder: z.boolean().default(false),
  })
  .strict()
  .superRefine((item, ctx) => {
    const marked =
      item.title.de.startsWith(PLACEHOLDER_PREFIX.de) &&
      item.title.en.startsWith(PLACEHOLDER_PREFIX.en);
    if (item.placeholder !== marked) {
      ctx.addIssue({
        code: 'custom',
        path: ['placeholder'],
        message:
          'A placeholder sets `placeholder: true` and its title starts with ' +
          '"PLATZHALTER" (de) and "PLACEHOLDER" (en); a confirmed entry does neither.',
      });
    }
    if (!item.placeholder && !item.start) {
      ctx.addIssue({
        code: 'custom',
        path: ['start'],
        message: 'A confirmed entry needs `start`.',
      });
    }
    if (item.end && (!item.start || item.end < item.start)) {
      ctx.addIssue({ code: 'custom', path: ['end'], message: '`end` needs a `start` before it.' });
    }
  });

const review = z
  .object({
    id: z.string().min(1),
    section: z.literal('review'),
    order: z.number().int(),
    /** The journal's name as Crossref gives it for the ISSN. */
    journal: z.string().min(1),
    /** The ISSN ORCID groups the reviews by. */
    issn: z.string().regex(/^\d{4}-\d{3}[\dX]$/),
    /** The completion year of each review: one number per review. */
    years: z.array(z.number().int().min(1900)).min(1),
  })
  .strict();

export const cvSchema = z.discriminatedUnion('section', [entry, review]);
