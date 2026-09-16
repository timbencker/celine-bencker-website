import { z } from 'astro/zod';

/**
 * Frontmatter block for CV (board 7b): the page's copy in one language.
 * OWNER: the CV work unit. The facts live in `src/content/data/cv.yaml`.
 */
const text = z.string().min(1);

/** "{n} reviews" — `{n}` is replaced by the number. */
const countTemplate = z.string().regex(/\{n\}/, 'Needs the placeholder {n}.');

export const cvBlock = z
  .object({
    /** Under the title, while no CV PDF exists under `public/`. */
    intro: text,
    /** Under the title once the PDF exists — it may promise the PDF. */
    introWithPdf: text,
    /** "Was ich mitbringe" — three hairline rows beside a heading. */
    strengths: z
      .object({
        heading: text,
        /** The small line under the heading. */
        note: text,
        items: z
          .array(z.object({ title: text, text }).strict())
          .min(1)
          .max(3),
      })
      .strict(),
    /** Group headings, in the order the page shows them. */
    sections: z
      .object({
        education: text,
        positions: text,
        funding: text,
        publications: text,
        talks: text,
        teaching: text,
        service: text,
      })
      .strict(),
    /** Before the start of something still running: "seit 2023". */
    since: text,
    /** After the venue of a preprint. */
    preprint: text,
    /** The one row that sums the peer-review records. */
    reviews: z
      .object({
        title: text,
        /** Intl plural categories this site's two languages use. */
        one: countTemplate,
        other: countTemplate,
      })
      .strict(),
  })
  .strict();

export type CvBlock = z.infer<typeof cvBlock>;
