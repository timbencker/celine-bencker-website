/**
 * Encodes every character as a numeric HTML entity.
 *
 * The brief asks for the address to be "verschleiert". This keeps naive
 * harvesters that grep raw HTML from reading it, needs no JavaScript, and
 * browsers and screen readers decode it transparently. It is a speed bump,
 * not protection — the address is public on the university site anyway.
 */
export function toHtmlEntities(value: string): string {
  return Array.from(value, (ch) => `&#${ch.codePointAt(0)};`).join('');
}
