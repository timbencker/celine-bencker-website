/**
 * `npm run check:launch`: is the built site ready to go public?
 *
 * Reads the existing `dist/` (it does not build) and counts two things in
 * every HTML, BibTeX, text and XML file:
 *
 * - placeholder text: every `PLATZHALTER` or `PLACEHOLDER`. Case-sensitive on
 *   purpose — the inlined stylesheet contains `::placeholder`, which is CSS,
 *   not unfinished content;
 * - launch blockers: every element marked `data-launch-blocker`, quoted with
 *   the text it carries, so the list says what is left instead of naming one
 *   known case.
 *
 * Prints when `dist/` was written (a stale build is otherwise invisible), a
 * table per file, and exits 1 while anything is left. The deploy workflow runs
 * it after the e2e suite, which builds `dist/`.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
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

// This check reads a build, it does not make one — so it says how old that
// build is. An hour-old dist/ explains a result the source no longer matches.
const written = statSync(DIST).mtime;
const minutes = Math.round((Date.now() - written.getTime()) / 60_000);
const age =
  minutes < 1
    ? 'just now'
    : minutes < 90
      ? `${minutes} min ago`
      : `${Math.round(minutes / 60)} h ago`;
console.log(
  `dist/ was written ${written.toISOString().replace('T', ' ').slice(0, 19)} UTC (${age}).`,
);

/** The text of the element carrying the attribute, with its tags removed. */
function blockerText(html: string, attributeAt: number): string {
  const tagStart = html.lastIndexOf('<', attributeAt);
  const name = /^<([a-zA-Z][\w-]*)/.exec(html.slice(tagStart, attributeAt))?.[1];
  const tagEnd = html.indexOf('>', attributeAt);
  if (!name || tagEnd === -1 || html[tagEnd - 1] === '/') return '(no text)';

  // Its closing tag, counting the same tag opened in between.
  const tags = new RegExp(`<(/?)${name}\\b`, 'gi');
  tags.lastIndex = tagEnd + 1;
  let depth = 1;
  let end = html.length;
  for (let tag = tags.exec(html); tag && depth > 0; tag = tags.exec(html)) {
    depth += tag[1] ? -1 : 1;
    if (depth === 0) end = tag.index;
  }

  const text = html
    .slice(tagEnd + 1, end)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  if (text === '') return '(no text)';
  return text.length > 160 ? `${text.slice(0, 159)}…` : text;
}

interface Row {
  file: string;
  placeholders: number;
  /** One entry per blocker: the words it puts on the page. */
  blockers: string[];
}

const rows: Row[] = readdirSync(DIST, { recursive: true, encoding: 'utf8' })
  .filter((path) => EXTENSIONS.has(extname(path)))
  .map((path) => {
    const text = readFileSync(`${DIST}${path}`, 'utf8');
    return {
      file: relative(ROOT, `${DIST}${path}`).replace(/\\/g, '/'),
      placeholders: text.match(PLACEHOLDER)?.length ?? 0,
      blockers: [...text.matchAll(LAUNCH_BLOCKER)].map((match) => blockerText(text, match.index)),
    };
  })
  .filter((row) => row.placeholders > 0 || row.blockers.length > 0)
  .sort((a, b) => a.file.localeCompare(b.file));

const total = {
  placeholders: rows.reduce((sum, row) => sum + row.placeholders, 0),
  blockers: rows.reduce((sum, row) => sum + row.blockers.length, 0),
};

if (rows.length === 0) {
  console.log('Launch check passed: no placeholder text and no launch blockers in dist/.');
  process.exit(0);
}

const headers = ['File', 'Placeholders', 'Launch blockers'] as const;
const lines = [
  ...rows.map((row) => [row.file, String(row.placeholders), String(row.blockers.length)]),
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
if (total.blockers > 0) {
  console.log('\nLaunch blockers, in their own words:');
  for (const row of rows.filter((candidate) => candidate.blockers.length > 0)) {
    console.log(`  ${row.file}`);
    for (const text of row.blockers) console.log(`    - ${text}`);
  }
}

console.log(
  '\nNot ready to publish. Replace every PLATZHALTER / PLACEHOLDER text in src/content/, ' +
    'and resolve every launch blocker above — each one disappears with the text that ' +
    'carries it. Then build and run this check again.',
);
process.exit(1);
