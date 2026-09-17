import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * The widths the suites run at, in one place: site.spec.ts audits three of
 * them in depth and layout.spec.ts covers the rest, so neither may guess what
 * the other checks.
 */

/** One width per tier — phone, tablet, desktop. */
export const AUDIT_VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
];

const TOKENS = fileURLToPath(new URL('../../../src/styles/tokens.css', import.meta.url));

/**
 * Where the desktop tier starts, read from the stylesheet that defines it
 * rather than repeated here: a moved breakpoint must move the tests with it.
 */
function readDesktopBreakpoint(): number {
  const match = /--breakpoint-desktop:\s*([\d.]+)rem\s*;/.exec(readFileSync(TOKENS, 'utf8'));
  if (!match?.[1]) {
    throw new Error(
      `No "--breakpoint-desktop: <n>rem" in ${TOKENS}. The layout tests read the desktop tier from there.`,
    );
  }
  return Number.parseFloat(match[1]) * 16;
}

/** `--breakpoint-desktop` in px, e.g. 1120. */
export const DESKTOP = readDesktopBreakpoint();
