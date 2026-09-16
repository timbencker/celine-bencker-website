import { cva } from 'class-variance-authority';

/**
 * Class vocabulary shared by more than one component. Anything used once lives
 * in its component. Values come from `_Komponenten`; there is one breakpoint
 * (`md`, 768px) and every component has exactly one mobile behaviour.
 */

/** Page width: 1280 max, 20px margin on phones, 48px from `md`. */
export const container = 'mx-auto w-full max-w-content px-5 md:px-12';

/**
 * The → that nudges right when its link is hovered. The link needs `group`.
 * Reduced motion is handled globally in global.css.
 */
export const arrow =
  'inline-block transition-transform duration-[180ms] ease-out group-hover:translate-x-[5px]';

/** "↗" for links that leave the site. U+FE0E keeps it a text glyph, never an emoji. */
export const EXTERNAL_GLYPH = '\u2197\uFE0E';

export const heading = cva('font-bold text-balance', {
  variants: {
    level: {
      /** Section title — 32px on phones, 44px from md. */
      section: 'text-[32px] leading-none tracking-[-0.035em] md:text-h2',
    },
  },
});
