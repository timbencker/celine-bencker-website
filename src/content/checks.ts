/**
 * Build-time checks on the page files that the schemas cannot express.
 *
 * Kept free of `astro:*` imports (types only), so plain Node can load this
 * file in the unit tests.
 */

export interface PageForBodyCheck {
  entry: { id: string; body?: string };
  translationKey: string;
}

/**
 * A page with its own view (src/views/registry.ts) is built from the named
 * blocks in its front matter; the Markdown body below the second `---` is
 * never rendered. Text written there would silently vanish from the site, so
 * the build stops and names every such file instead.
 *
 * Pages without their own view fall back to the draft view, which does render
 * the body, so their body is allowed.
 */
export function assertNoIgnoredBodies(
  pages: readonly PageForBodyCheck[],
  renderedKeys: readonly string[],
): void {
  const rendered = new Set(renderedKeys);
  const files = pages
    .filter((page) => rendered.has(page.translationKey) && page.entry.body?.trim())
    .map((page) => `  - src/content/pages/${page.entry.id}.md`);

  if (files.length > 0) {
    throw new Error(
      `Text below the front matter is not shown on these pages:\n${files.join('\n')}\n\n` +
        'Their text lives in the named blocks of the front matter (between the two `---` ' +
        'lines). Move the text into the matching block and leave nothing below the second ' +
        '`---`. See README.md → "Inhalte bearbeiten".',
    );
  }
}
