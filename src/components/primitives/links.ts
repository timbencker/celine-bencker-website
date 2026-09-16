/**
 * Where a link goes decides how it looks — "Button & Link" in _Komponenten:
 * "Die Variante ergibt sich aus der URL, nicht aus dem Autor:innen-Gefühl."
 *
 * - `internal` — a root-relative path or a #fragment: →, same tab.
 * - `external` — http(s): ↗, a new tab, and a spoken warning.
 * - `mail` — mailto: no glyph, same tab, address written as entities.
 */
export type LinkKind = 'internal' | 'external' | 'mail';

export function linkKind(href: string): LinkKind {
  // A bare "#" is a link without a target; the rule is to omit those.
  if (href === '#') {
    throw new Error('A link needs a real target. Omit the link instead of using "#".');
  }
  // `//host` is protocol-relative, so it leaves the site despite the slash.
  if (/^\/(?!\/)/.test(href) || href.startsWith('#')) return 'internal';
  if (href.startsWith('mailto:')) return 'mail';
  if (/^https?:\/\//.test(href)) return 'external';
  throw new Error(
    `Unsupported link target "${href}". Use a root-relative path, a #fragment, mailto: or http(s)://.`,
  );
}

/** Splits `mailto:address?subject=…` so MailLink can write the address as entities. */
export function parseMailto(href: string): { email: string; subject?: string } {
  const url = new URL(href);
  const subject = url.searchParams.get('subject') ?? undefined;
  return { email: decodeURIComponent(url.pathname), subject };
}
