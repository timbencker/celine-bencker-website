import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge only knows Tailwind's default scales. Without these lists it
 * reads the custom font-size tokens (`text-h3`, `text-meta`, …) as colours and
 * silently drops one of `text-lead-sm text-text-2`. Keep in step with
 * `src/styles/tokens.css`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['display', 'h2', 'h3', 'h3-lookup', 'lead', 'lead-sm', 'body', 'meta', 'quote'],
      radius: ['image', 'card', 'pill'],
      container: ['content'],
      spacing: [
        'section-compact',
        'section',
        'section-read',
        'gutter',
        'grid-gap',
        'split-wide',
        'split-narrow',
      ],
    },
  },
});

/** Merge conditional class lists, with later Tailwind utilities winning. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
