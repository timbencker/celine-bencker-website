import { cva } from 'class-variance-authority';

/**
 * Class vocabulary shared by more than one component. Anything used once lives
 * in its component. Values come from `_Komponenten`; there is one breakpoint
 * (`md`, 768px) and every component has exactly one mobile behaviour.
 */

/** Page width: 1280 max, 20px margin on phones, 48px from `md`. */
export const container = 'mx-auto w-full max-w-content px-5 md:px-12';

/**
 * Title + prose on the 5/7 grid — `split` in _Komponenten. Section uses it;
 * so do the rows inside a `framed` section, which the board draws as 5/7 too.
 * The first child takes 5 columns, the last 7; phones stack them.
 *
 * Written as two tracks rather than `grid-cols-12 gap-16`: twelve columns need
 * 11 × 64px = 704px of gaps, more than the 657–672px content width between
 * 768 and 799px, so every column collapsed to zero there. The first track is
 * exactly 5 of those columns plus their 4 gaps — `(100% − 704px) × 5/12 +
 * 256px` — so layouts from 800px up are unchanged, and it stays positive at
 * every width from md.
 */
export const splitGrid =
  'grid gap-6 md:grid-cols-[calc((100%_-_704px)*5/12_+_256px)_minmax(0,1fr)] md:gap-16';

/**
 * The → that nudges right when its link is hovered. The link needs `group`.
 * Reduced motion is handled globally in global.css.
 */
export const arrow =
  'inline-block transition-transform duration-[180ms] ease-out group-hover:translate-x-[5px]';

/** "↗" for links that leave the site. U+FE0E keeps it a text glyph, never an emoji. */
export const EXTERNAL_GLYPH = '↗︎';

/**
 * Heading steps from the typography table in _Komponenten. They style any
 * element, so a list title that is not a heading can share a step.
 */
export const heading = cva('font-bold text-balance', {
  variants: {
    level: {
      /** Section title — 32px on phones, 44px from md. */
      section: 'text-[32px] leading-none tracking-[-0.035em] md:text-h2',
      /**
       * h3 for navigating rows and the research lines, and the CV group
       * titles — 22px on phones, 28px from md.
       */
      row: 'text-[22px] leading-[1.1] tracking-[-0.03em] md:text-h3',
      /**
       * h3 for look-up rows (publications, methods, "Was ich mitbringe") —
       * 18px on phones, 22px from md.
       */
      lookup: 'text-[18px] leading-[1.25] tracking-[-0.02em] md:text-h3-lookup',
    },
  },
});
