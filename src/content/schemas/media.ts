import { z } from 'astro/zod';

import { LOCALES } from '../../i18n/config';
import { partialDate } from './talks';

/** The kind of piece. The page block names each one. */
export const mediaFormat = z.enum([
  'interview',
  'guest-article',
  'podcast',
  'radio',
  'tv',
  'print',
  'online',
]);

/**
 * The large quote on Talks & Media. It must be real and approved by Celine
 * (_Komponenten, QuoteBlock) — `approved: true` is required, so an unchecked
 * quote cannot reach the page.
 */
const quote = z
  .object({
    text: z.string().min(1),
    /** The language the quote was said in. */
    lang: z.enum(LOCALES),
    approved: z.literal(true),
    /** A short audio excerpt, on the outlet's site. */
    audio: z.url().optional(),
  })
  .strict();

/**
 * Media appearances — language-neutral.
 * OWNER: the Talks & Media work unit.
 *
 * Every piece is a tile that links to it, so `url` is required.
 */
export const mediaSchema = z
  .object({
    id: z.string().min(1),
    date: partialDate,
    outlet: z.string().min(1),
    title: z.string().min(1),
    lang: z.enum(LOCALES),
    format: mediaFormat,
    url: z.url(),
    /** At most one piece carries a quote; the page fails the build otherwise. */
    quote: quote.optional(),
  })
  .strict();
