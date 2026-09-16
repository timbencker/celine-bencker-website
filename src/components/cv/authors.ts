/**
 * The short author line the CV board shows for a publication — "Bencker et
 * al.", "Roth, Bencker et al." — derived from the APA author list the
 * publications collection keeps ("Bencker, C., Tran, U. S., & Nater, U. M.").
 *
 * Only family names are read, so a list in another format is shown whole
 * rather than guessed at.
 */

/** One or more initials: "C.", "U. S.", "J.-P." */
const INITIALS = /^(\p{Lu}\.[\s-]?)+$/u;

/** Family names in author order, or `null` when the list is not APA-shaped. */
export function familyNames(authors: string): string[] | null {
  const parts = authors
    .trim()
    .split(/\s*(?:,\s*&|,|&)\s*/)
    .filter(Boolean);
  if (parts.length < 2 || parts.length % 2 !== 0) return null;

  const names: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    // APA 7 shortens 21+ authors to "…, S., ... Last, L."; the gap is not a name.
    const family = parts[i]!.replace(/^(\.\.\.|…)\s*/, '');
    const initials = parts[i + 1]!;
    if (!family || !INITIALS.test(initials) || INITIALS.test(family)) return null;
    names.push(family);
  }
  return names;
}

/**
 * - first author: "Bencker et al."
 * - second: "Roth, Bencker et al."
 * - further back: "Keil, …, Bencker et al."
 * - two authors: both names.
 */
export function shortAuthors(authors: string, ownFamilyName: string): string {
  const names = familyNames(authors);
  if (!names) return authors;

  const [first] = names as [string, ...string[]];
  const count = names.length;
  if (count === 1) return first;
  if (count === 2) return `${first} & ${names[1]}`;

  const own = names.findIndex(
    (name) => name.localeCompare(ownFamilyName, undefined, { sensitivity: 'base' }) === 0,
  );
  if (own <= 0) return `${first} et al.`;

  const lead = own === 1 ? first : `${first}, …`;
  const rest = own < count - 1 ? ' et al.' : '';
  return `${lead}, ${names[own]}${rest}`;
}
