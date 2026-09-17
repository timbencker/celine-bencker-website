import type { Page } from '@playwright/test';

/**
 * Layout probes that run inside the page. Both return plain data, so a spec
 * can decide what to assert and how to word the failure.
 */

export interface Overflow {
  scrollWidth: number;
  clientWidth: number;
  /** The widest elements that stick out past the viewport, outside any clipping box. */
  offenders: string[];
}

/** Whether the page is wider than its viewport, and which elements cause it. */
export function measureOverflow(page: Page): Promise<Overflow> {
  return page.evaluate(() => {
    const root = document.documentElement;
    const limit = root.clientWidth;
    const clipped = (el: Element) => {
      for (let p = el.parentElement; p && p !== root; p = p.parentElement) {
        if (getComputedStyle(p).overflowX !== 'visible') return true;
      }
      return false;
    };
    const describe = (el: Element) =>
      el.tagName.toLowerCase() +
      (el.id ? `#${el.id}` : '') +
      (typeof el.className === 'string' && el.className.trim()
        ? `.${el.className.trim().split(/\s+/).slice(0, 4).join('.')}`
        : '');
    const offenders = Array.from(document.body.querySelectorAll('*'))
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.right > limit + 0.5 && !clipped(el);
      })
      .slice(0, 8)
      .map((el) => `${describe(el)} ends at ${Math.round(el.getBoundingClientRect().right)}px`);
    return { scrollWidth: root.scrollWidth, clientWidth: limit, offenders };
  });
}

/**
 * Words the browser split across two lines without a hyphen.
 *
 * `overflow-wrap: break-word` (global.css) keeps a word that does not fit its
 * column from overflowing, by breaking it anywhere. That is a safety net, not
 * a layout: a column too narrow for its words is a bug. A split is fine only
 * right after a hyphen, dash or slash. Mail addresses and URLs may break
 * anywhere (the spec asks for `break-all` on addresses).
 *
 * Each entry reads like `Einger|eicht (h2, 44px)`.
 */
export function findMidWordBreaks(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const found: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const top = (range: Range) => {
      const rect = [...range.getClientRects()].find((r) => r.width > 0);
      return rect ? Math.round(rect.top) : null;
    };

    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const el = node.parentElement;
      if (!el) continue;
      // Hidden, decorative, or inside a closed disclosure: not on screen.
      if (el.closest('[aria-hidden="true"], script, style, template')) continue;
      if (el.closest('details:not([open])') && !el.closest('summary')) continue;
      if (el.closest('a[href^="mailto:"]')) continue;
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      if (el.getBoundingClientRect().width <= 1) continue;

      const text = node.textContent ?? '';
      for (const match of text.matchAll(/\S{2,}/g)) {
        const word = match[0];
        if (/@|:\/\/|^www\.|^10\.\d/.test(word)) continue;
        const start = match.index ?? 0;

        const whole = document.createRange();
        whole.setStart(node, start);
        whole.setEnd(node, start + word.length);
        const lines = new Set(
          [...whole.getClientRects()].filter((r) => r.width > 0).map((r) => Math.round(r.top)),
        );
        if (lines.size < 2) continue;

        // Find where the word moves to the next line.
        let previous: number | null = null;
        const splits: number[] = [];
        for (let i = 0; i < word.length; i++) {
          const char = document.createRange();
          char.setStart(node, start + i);
          char.setEnd(node, start + i + 1);
          const current = top(char);
          if (current === null) continue;
          if (previous !== null && Math.abs(current - previous) > 2) splits.push(i);
          previous = current;
        }
        for (const i of splits) {
          if (/[-‐–—/]/.test(word[i - 1] ?? '')) continue;
          found.push(
            `${word.slice(0, i)}|${word.slice(i)} (${el.tagName.toLowerCase()}, ${style.fontSize})`,
          );
        }
      }
    }
    return found;
  });
}
