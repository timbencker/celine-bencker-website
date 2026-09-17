import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveDeployment } from '../../src/config/deployment.ts';

/**
 * The deployment target (src/config/deployment.ts): the one place that turns
 * the SITE and BASE_PATH environment variables into the values astro.config.mjs,
 * the e2e suite and the Lighthouse runner use.
 */

describe('resolveDeployment', () => {
  it('defaults to the GitHub Pages project site', () => {
    assert.deepEqual(resolveDeployment({}), {
      site: 'https://timbencker.github.io',
      astroBase: '/celine-bencker-website',
      basePath: '/celine-bencker-website/',
      productionBaseUrl: 'https://timbencker.github.io/celine-bencker-website/',
    });
  });

  it('serves a custom domain from the root', () => {
    assert.deepEqual(resolveDeployment({ SITE: 'https://celinebencker.com', BASE_PATH: '/' }), {
      site: 'https://celinebencker.com',
      astroBase: '/',
      basePath: '/',
      productionBaseUrl: 'https://celinebencker.com/',
    });
  });

  it('normalises missing and extra slashes', () => {
    for (const BASE_PATH of ['site', '/site', 'site/', '//site//']) {
      const { astroBase, basePath } = resolveDeployment({ BASE_PATH });
      assert.equal(astroBase, '/site', BASE_PATH);
      assert.equal(basePath, '/site/', BASE_PATH);
    }
  });

  it('rejects a base path that Git Bash rewrote into a Windows path', () => {
    assert.throws(
      () => resolveDeployment({ BASE_PATH: 'C:/Program Files/Git/' }),
      /BASE_PATH[\s\S]*MSYS_NO_PATHCONV=1/,
    );
  });

  it('rejects a SITE that is not an absolute http(s) URL', () => {
    assert.throws(() => resolveDeployment({ SITE: 'timbencker.github.io' }), /SITE/);
  });
});
