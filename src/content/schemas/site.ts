import { z } from 'astro/zod';

import { localized } from './shared';

/** Site-wide settings — one file. Shared: changes go through the manager. */
export const siteSchema = z
  .object({
    siteName: z.string().min(1),
    tagline: localized,
    email: z.email().optional(),
    orcid: z.string().optional(),
    affiliation: localized.optional(),
    /** External profiles, in display order. Only listed ones are shown. */
    profiles: z.array(z.object({ label: z.string().min(1), url: z.url() }).strict()).default([]),
    /** Designer credit in the footer. */
    credit: z.object({ label: localized, url: z.url().optional() }).strict().optional(),
  })
  .strict();
