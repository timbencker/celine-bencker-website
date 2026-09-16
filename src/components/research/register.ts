/**
 * The two registers of the Research page, switched without JavaScript.
 *
 * RegisterToggle renders two radio inputs in the page header; the one for the
 * plain register has the id `register-plain`. Whatever should change with the
 * choice carries one of the classes below, which test that radio from the
 * document root with `:has()`.
 *
 * Without `:has()` support those rules are dropped as invalid, so the page
 * stays in the specialist register (and RegisterToggle hides itself).
 *
 * Tailwind finds classes by reading source files, so each selector is written
 * out in full; keep the id in them equal to `PLAIN_REGISTER_ID`.
 */
export const PLAIN_REGISTER_ID = 'register-plain';

/** Specialist content that has a plain counterpart: hidden in the plain register. */
export const expertOnly = '[:root:has(#register-plain:checked)_&]:hidden';

/** Plain-language content: hidden until the plain register is chosen. */
export const plainOnly = 'hidden [:root:has(#register-plain:checked)_&]:block';

/** Kept in the layout in both registers, visible in the plain one only. */
export const plainVisible = 'invisible [:root:has(#register-plain:checked)_&]:visible';
