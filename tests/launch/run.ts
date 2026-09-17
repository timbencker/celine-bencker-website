/**
 * `npm run check:launch`: is the built site ready to go public?
 *
 * Reads the existing `dist/` (it does not build) and counts two things in
 * every HTML, BibTeX, text and XML file:
 *
 * - placeholder text: every `PLATZHALTER` or `PLACEHOLDER`. Case-sensitive on
 *   purpose — the inlined stylesheet contains `::placeholder`, which is CSS,
 *   not unfinished content;
 * - launch blockers: every element marked `data-launch-blocker`, such as the
 *   note that the legal text has not been reviewed yet (ContactView.astro).
 *
 * Prints a table per file and exits 1 while anything is left. The deploy
 * workflow runs it after the e2e suite, which builds `dist/`.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const DIST = fileURLToPath(new URL('../../dist/', import.meta.url));

const EXTENSIONS = new Set(['.html', '.bib', '.txt', '.xml']);
const PLACEHOLDER = /PLATZHALTER|PLACEHOLDER/g;
// The attribute, with or without a value: `data-launch-blocker`, `data-launch-blocker="…"`.
const LAUNCH_BLOCKER = /\sdata-launch-blocker(?=[\s=/>])/g;

if (!existsSync(DIST)) {
  console.error('dist/ does not exist. Build the site first: `npm run build`.');
  process.exit(1);
}

interface Row {
  file: string;
  placeholders: number;
  blockers: number;
}

const rows: Row[] = readdirSync(DIST, { recursive: true, encoding: 'utf8' })
  .filter((path) => EXTENSIONS.has(extname(path)))
  .map((path) => {
    const text = readFileSync(`${DIST}${path}`, 'utf8');
    return {
      file: relative(ROOT, `${DIST}${path}`).replace(/\\/g, '/'),
      placeholders: text.match(PLACEHOLDER)?.length ?? 0,
      blockers: text.match(LAUNCH_BLOCKER)?.length ?? 0,
    };
  })
  .filter((row) => row.placeholders > 0 || row.blockers > 0)
  .sort((a, b) => a.file.localeCompare(b.file));

const total = {
  placeholders: rows.reduce((sum, row) => sum + row.placeholders, 0),
  blockers: rows.reduce((sum, row) => sum + row.blockers, 0),
};

if (rows.length === 0) {
  console.log('Launch check passed: no placeholder text and no launch blockers in dist/.');
  process.exit(0);
}

const headers = ['File', 'Placeholders', 'Launch blockers'] as const;
const lines = [
  ...rows.map((row) => [row.file, String(row.placeholders), String(row.blockers)]),
  ['Total', String(total.placeholders), String(total.blockers)],
];
const widths = headers.map((header, column) =>
  Math.max(header.length, ...lines.map((line) => line[column]!.length)),
);
const format = (cells: readonly string[]) =>
  cells
    .map((cell, column) =>
      column === 0 ? cell.padEnd(widths[0]!) : cell.padStart(widths[column]!),
    )
    .join('  ');

console.log(format(headers));
console.log(widths.map((width) => '-'.repeat(width)).join('  '));
for (const line of lines.slice(0, -1)) console.log(format(line));
console.log(widths.map((width) => '-'.repeat(width)).join('  '));
console.log(format(lines.at(-1)!));
console.log(
  '\nNot ready to publish. Replace every PLATZHALTER / PLACEHOLDER text in src/content/, ' +
    'and resolve every launch blocker — today that is the legal review note ' +
    '(`imprint.reviewNote` on the contact pages), removed once the legal text has been ' +
    'reviewed. Then build and run this check again.',
);
process.exit(1);
