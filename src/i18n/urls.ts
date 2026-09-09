/**
 * `import.meta.env.BASE_URL` is '/celine-bencker-website' — without a trailing
 * slash — so naive concatenation produces '/celine-bencker-websitede/'.
 * Everything that builds a URL by hand goes through here instead.
 *
 * Prefer `getRelativeLocaleUrl()` from `astro:i18n` where a locale and slug are
 * available; this is for the few places that cannot use it, such as the root
 * redirect page which sits outside the locale routing.
 */
export const BASE: string = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

/** Joins a path onto the deployment base, avoiding doubled or missing slashes. */
export function withBase(path: string): string {
  return `${BASE}${path.replace(/^\//, '')}`;
}
