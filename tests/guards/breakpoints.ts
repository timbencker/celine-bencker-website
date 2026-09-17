/**
 * `node tests/guards/breakpoints.ts` — part of `npm run lint`.
 *
 * The site has three tiers (src/styles/tokens.css): phone as the base,
 * `tablet:` and `desktop:`. Tailwind's default breakpoint names are switched
 * off there, so a leftover `md:` or `lg:` would silently generate no CSS and
 * the layout would quietly lose a rule. This guard fails on any of them.
 *
 * Allowed: `tablet:`, `desktop:`, their `max-` forms, and container-query
 * variants (`@xl:`, `@5xl:`), which size against a container, not the screen.
 *
 * A match must start where a class starts — the beginning of the line, a
 * space, a quote, a backtick, `{` or `(` — so that a file name in prose
 * (`docs/i18n-policy.md:`) is not read as a class.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const SRC = join(ROOT, 'src');

/** Tailwind's default screen variants, plain or `max-`, and arbitrary `min-[…]:` / `max-[…]:`. */
const FORBIDDEN = /(?<=^|[\s"'`{(])(?:(?:max-)?(?:sm|md|lg|xl|2xl)|(?:min|max)-\[[^\]\s]*\]):/g;

const files = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
  .filter((file) => /\.(astro|ts|css|mjs)$/.test(file))
  .map((file) => join(SRC, file));

const findings: string[] = [];
for (const file of files) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, index) => {
      for (const match of line.matchAll(FORBIDDEN)) {
        findings.push(`${relative(ROOT, file)}:${index + 1}  ${match[0]}`);
      }
    });
}

if (findings.length > 0) {
  console.error(
    `Default Tailwind breakpoints found (${findings.length}). Use \`tablet:\` or \`desktop:\` ` +
      '(see src/styles/tokens.css):\n' +
      findings.map((finding) => `  ${finding}`).join('\n'),
  );
  process.exit(1);
}
console.log(`Breakpoint guard: ${files.length} files, no default breakpoints.`);
