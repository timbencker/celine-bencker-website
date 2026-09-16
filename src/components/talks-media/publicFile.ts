import { statSync } from 'node:fs';

import { withBase } from '../../i18n/urls';

export interface PublicFile {
  /** Root-relative, including the deployment base. */
  href: string;
  /** From the extension: "ZIP", "PDF". */
  format: string;
  bytes: number;
}

/**
 * A download under `public/`, measured at build time — or `null` while the
 * file does not exist, so the control that offers it is left out instead of
 * pointing nowhere. Paths are relative to the project root, where Astro runs
 * the build.
 */
export function findPublicFile(path: string): PublicFile | null {
  const stats = statSync(`public/${path}`, { throwIfNoEntry: false });
  if (!stats?.isFile()) return null;
  const extension = path.slice(path.lastIndexOf('.') + 1);
  return { href: withBase(path), format: extension.toUpperCase(), bytes: stats.size };
}
