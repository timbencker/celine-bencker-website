import { z } from 'astro/zod';

/**
 * Frontmatter block for Contact (board 9b), including the Impressum section.
 * OWNER: the Contact work unit.
 *
 * The address itself is never page copy: it comes from site.yaml, and
 * MailLink writes it as HTML entities.
 */

const text = z.string().min(1);

/**
 * Sentences that render as one paragraph. One entry per sentence, so each
 * can be reviewed and changed on its own — the Impressum is legal text.
 */
const sentences = z.array(text).min(1);

/** A section anchor on the target page, without the `#`. */
const anchor = z
  .string()
  .regex(/^[a-z0-9-]+$/, 'anchor is an id such as "stress-im-alltag", without "#"');

const reasonCopy = {
  /** Small line above the title: the kind of request. */
  eyebrow: text,
  title: text,
  /** The sage call to action at the bottom of the tile. */
  action: text,
};

/** A reason answered by mail; the subject arrives pre-filled. */
const mailReason = z.object({ ...reasonCopy, subject: text }).strict();

/** A reason answered by another page, named by its translationKey. */
const pageReason = z.object({ ...reasonCopy, to: text, anchor: anchor.optional() }).strict();

export const contactBlock = z
  .object({
    /** The lead under the title. */
    intro: text,
    /**
     * A promise about reply times, appended to the intro. Optional, because
     * only Celine can make that commitment.
     */
    replyNote: text.optional(),

    /** Spoken name of the tile list, which has no visible heading. */
    reasonsLabel: text,
    /** The three reasons to write: a mail with a subject, or a page. */
    reasons: z.array(z.union([mailReason, pageReason])).length(3),

    institute: z
      .object({
        heading: text,
        organisation: text,
        department: text,
        address: text,
        profilesHeading: text,
      })
      .strict(),

    /**
     * The Impressum. Its heading is the footer's link text (`footer.imprint`
     * in ui.ts), so the link and its target always say the same thing.
     */
    imprint: z
      .object({
        /** Shown at the top of the section until the text has been reviewed. */
        reviewNote: text.optional(),
        ownerLabel: text,
        ownerName: text,
        ownerAddress: text,
        /** The note on the Austrian Media Act (§ 25 MedienG). */
        mediaLaw: sentences,
        privacyLabel: text,
        privacy: sentences,
      })
      .strict(),
  })
  .strict();
