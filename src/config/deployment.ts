import { env } from 'node:process';

/**
 * Deployment target — the one place that reads the SITE and BASE_PATH
 * environment variables.
 *
 * GitHub Pages serves project sites from a sub-path, so the base path must
 * match the repository name. When a custom domain is added later, set `SITE`
 * to that domain and `BASE_PATH` to '/' — nothing else needs to change.
 *
 * astro.config.mjs, the e2e suite and the Lighthouse runner all import this
 * file, so they cannot disagree about where the site lives. It imports only
 * Node built-ins: plain Node and Playwright load it as well as Astro.
 */

export interface Deployment {
  /** Origin of the published site, e.g. `https://timbencker.github.io`. */
  site: string;
  /** What astro.config.mjs passes as `base`: no trailing slash, `/` for the root. */
  astroBase: string;
  /** The base with leading and trailing slash, e.g. `/celine-bencker-website/`. */
  basePath: string;
  /** Absolute URL of the published home, e.g. `https://timbencker.github.io/celine-bencker-website/`. */
  productionBaseUrl: string;
}

const DEFAULT_SITE = 'https://timbencker.github.io';
const DEFAULT_BASE_PATH = '/celine-bencker-website';

/**
 * A URL path segment as the site uses them: letters, digits, `_`, `-` and `.`
 * — a user site lives under `x.github.io`. `.` and `..` alone are path
 * navigation, not a name.
 */
const SEGMENT = /^(?!\.\.?$)[\w.-]+$/;

/** A value the shell turned into a Windows path: a drive letter or a backslash. */
const WINDOWS_PATH = /^[A-Za-z]:[\\/]|\\/;

/**
 * An unset variable and an empty one mean the same thing: use the default. A
 * workflow that does not set `SITE` or `BASE_PATH` still passes `${{ vars.X }}`,
 * which GitHub Actions substitutes with an empty string — silently publishing
 * to the root, where every asset link breaks. The root is asked for with `/`.
 */
const given = (value: string | undefined) =>
  value === undefined || value === '' ? undefined : value;

export function resolveDeployment(vars: Record<string, string | undefined>): Deployment {
  const rawSite = given(vars.SITE) ?? DEFAULT_SITE;
  const rawBase = given(vars.BASE_PATH) ?? DEFAULT_BASE_PATH;

  let url: URL | undefined;
  try {
    url = new URL(rawSite);
  } catch {
    // Reported below with the other shapes that are not accepted.
  }
  if (!url || (url.protocol !== 'https:' && url.protocol !== 'http:')) {
    throw new Error(
      `SITE must be an absolute http(s) URL such as "https://example.com", got "${rawSite}".`,
    );
  }
  // A path on SITE would be dropped when the base is resolved against it; the
  // sub-path belongs in BASE_PATH.
  if (url.pathname !== '/' || url.search || url.hash) {
    throw new Error(
      `SITE must be an origin without a path, got "${rawSite}". Put the sub-path in BASE_PATH.`,
    );
  }

  // Leading and trailing slashes are optional; the segments in between are not.
  const trimmed = rawBase.replace(/^\/+|\/+$/g, '');
  const segments = trimmed === '' ? [] : trimmed.split('/');
  if (!segments.every((segment) => SEGMENT.test(segment))) {
    const message = `BASE_PATH must be a URL path such as "/celine-bencker-website" or "/", got "${rawBase}".`;
    throw new Error(
      // Only a value that looks like a Windows path came from the shell rather
      // than from whoever set the variable.
      WINDOWS_PATH.test(rawBase)
        ? `${message} Git Bash rewrites values that start with "/" into Windows paths ` +
            '(e.g. "C:/Program Files/Git/"); set MSYS_NO_PATHCONV=1 for that command.'
        : message,
    );
  }

  const astroBase = `/${segments.join('/')}`;
  const basePath = segments.length === 0 ? '/' : `${astroBase}/`;
  const site = url.origin;

  return {
    site,
    astroBase,
    basePath,
    productionBaseUrl: new URL(basePath, site).href,
  };
}

/** The deployment target of this process, from its environment. */
export const deployment = resolveDeployment(env);
