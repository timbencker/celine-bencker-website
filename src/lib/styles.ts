import { cva } from 'class-variance-authority';

/**
 * Class vocabulary shared by more than one component. Anything used once lives
 * in its component. Values come from `_Komponenten`.
 *
 * Three tiers (sizes and the reason for 1120: src/styles/tokens.css):
 * - phone, no prefix — one column, phone type, 20px margins.
 * - `tablet:` from 768px — still one column, stacked as on phones, with
 *   desktop type, 48px margins and desktop section and header spacing.
 * - `desktop:` from 1120px — the board layouts.
 *
 * Which tier a class takes:
 * - `desktop:` — everything that sets things side by side: `grid`,
 *   `grid-cols-*`, `col-*`, `subgrid`, `flex-row` and the alignment that
 *   belongs to such a row, column widths, the gaps of those grids and rows
 *   (stacked, they would turn into tall gaps), glyphs and line breaks that
 *   live in a column, and hairline or height resets that only make sense
 *   with something beside them.
 * - `tablet:` — everything else: margins, padding, type, colour, radii, and
 *   rows that stay rows when narrow because they wrap (Band, SiteFooter).
 *
 * Same-tier rule: an override — a variant over the base, a `class` prop over
 * a component's default, a compound variant — uses the tier of the class it
 * replaces. `cn` (tailwind-merge) only drops the loser when both carry the
 * same prefix; across tiers both classes stay, and the stylesheet decides:
 * Tailwind emits phone, then tablet, then desktop rules, so a higher tier
 * always beats a lower one and a lower one never beats a higher one, whatever
 * the order in the class list. A desktop class over a tablet one is therefore
 * only right when the change is meant to start at desktop.
 */

/** Page width: 1280 max, 20px margin on phones, 48px from tablet. */
export const container = 'mx-auto w-full max-w-content px-5 tablet:px-12';

/**
 * Title + prose on the 5/7 grid — `split` in _Komponenten. Section uses it;
 * so do the rows inside a `framed` section, which the board draws as 5/7 too.
 * The first child is the title, the last the prose; below desktop they stack
 * 24px apart.
 *
 * Two proportional tracks with one 64px gap, exactly as every board draws the
 * split (`minmax(0,5fr) minmax(0,7fr)`). _Komponenten writes it as 12 columns
 * with 64px gaps, which puts the prose 11px further left and collapses below
 * 800px, where the eleven gaps are wider than the content.
 */
export const splitGrid =
  'grid gap-6 desktop:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] desktop:gap-16';

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
      /**
       * Section title — 32px on phones, 44px from tablet. The phone tracking
       * would override `text-h2`'s −0.04em, so the tablet tier restates it.
       */
      section:
        'text-[32px] leading-none tracking-[-0.035em] tablet:text-h2 tablet:tracking-[-0.04em]',
      /**
       * h3 for navigating rows and the research lines, and the CV group
       * titles — 22px on phones, 28px from tablet.
       */
      row: 'text-[22px] leading-[1.1] tracking-[-0.03em] tablet:text-h3',
      /**
       * h3 for look-up rows (publications, methods, "Was ich mitbringe") —
       * 18px on phones, 22px from tablet.
       */
      lookup: 'text-[18px] leading-[1.25] tracking-[-0.02em] tablet:text-h3-lookup',
    },
  },
});
