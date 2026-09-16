import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

/** WCAG 2.0, 2.1 and 2.2, levels A and AA — the site's accessibility floor. */
export const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

type AxeResults = Awaited<ReturnType<AxeBuilder['analyze']>>;
export type AxeViolation = AxeResults['violations'][number];

export function runAxe(page: Page): Promise<AxeResults> {
  return new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
}

function snippet(html: string): string {
  const flat = html.replace(/\s+/g, ' ').trim();
  return flat.length > 160 ? `${flat.slice(0, 157)}...` : flat;
}

/**
 * One block per rule: id, impact, summary, help link, then every failing node
 * as its selector and a short HTML snippet.
 */
export function formatViolations(violations: AxeViolation[]): string {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => {
          const target = node.target
            .map((part) => (Array.isArray(part) ? part.join(' >>> ') : String(part)))
            .join(' ');
          return `      - ${target}\n        ${snippet(node.html)}`;
        })
        .join('\n');
      return (
        `  ${violation.id} [${violation.impact ?? 'no impact'}] ${violation.help} ` +
        `(${violation.nodes.length} node${violation.nodes.length === 1 ? '' : 's'})\n` +
        `    ${violation.helpUrl}\n${nodes}`
      );
    })
    .join('\n');
}
