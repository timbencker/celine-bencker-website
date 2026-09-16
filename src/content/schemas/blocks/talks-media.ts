import { z } from 'astro/zod';

import { mediaFormat } from '../media';
import { talkFormat } from '../talks';

/** One label for every value of an enum, so a new format cannot ship unnamed. */
const labelsFor = <T extends string>(values: readonly T[]) =>
  z
    .object(
      Object.fromEntries(values.map((value) => [value, z.string().min(1)])) as Record<
        T,
        z.ZodString
      >,
    )
    .strict();

/**
 * A file under `public/`, written without a leading slash
 * (`presse/pressekit.zip`). No `..`, no query.
 */
const publicFile = z
  .string()
  .regex(
    /^(?:[\w-]+\/)*[\w-]+(?:\.[\w-]+)*\.[a-z0-9]+$/i,
    'Name a file under public/ without a leading slash, e.g. presse/pressekit.zip.',
  );

/**
 * Frontmatter block for Talks & Media (board 8c). The title lines and the
 * one-line bio come from the page's `hero`; everything else the page says is
 * here. The talks and media themselves are records in
 * `src/content/data/talks.yaml` and `media.yaml`.
 * OWNER: the Talks & Media work unit.
 */
export const talksMediaBlock = z
  .object({
    /** The themes as questions, beside the title. */
    themes: z
      .object({
        /** Names the list for screen readers; not shown. */
        label: z.string().min(1),
        items: z.array(z.string().min(1)).min(1).max(4),
      })
      .strict(),

    /** The quote block. The quote itself is a media record with `quote`. */
    quote: z
      .object({
        /** Shown until media.yaml has an approved quote. */
        placeholder: z.string().min(1),
        /** Label of the photo slot until a press photo exists. */
        photo: z.string().min(1),
        /** Text of the audio link, when the quote has one. */
        listen: z.string().min(1),
      })
      .strict(),

    talks: z
      .object({
        upcomingHeading: z.string().min(1),
        pastHeading: z.string().min(1),
        formats: labelsFor(talkFormat.options),
      })
      .strict(),

    media: z
      .object({
        heading: z.string().min(1),
        /**
         * Shown while media.yaml is empty. Without it, the section is left out
         * until the first piece is listed.
         */
        placeholder: z.string().min(1).optional(),
        formats: labelsFor(mediaFormat.options),
      })
      .strict(),

    /** "Für Redaktionen" — the site's one lilac-tint section. */
    press: z
      .object({
        heading: z.string().min(1),
        intro: z.string().min(1),
        /** Formats and response time, in one short line. */
        note: z.string().min(1).optional(),
        /**
         * The press kit. The button appears only once `file` exists under
         * `public/`, with its real format and size.
         */
        kit: z
          .object({
            file: publicFile,
            label: z.string().min(1),
            /** What the kit holds; shown with the button. */
            contents: z.string().min(1),
          })
          .strict()
          .optional(),
      })
      .strict(),
  })
  .strict();
