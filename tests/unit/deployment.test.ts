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

  it('treats an empty variable as unset, as GitHub Actions passes it', () => {
    assert.deepEqual(resolveDeployment({ SITE: '', BASE_PATH: '' }), resolveDeployment({}));
  });

  it('allows a dot in a segment, but not a segment that is only dots', () => {
    assert.equal(resolveDeployment({ BASE_PATH: '/x.github.io' }).basePath, '/x.github.io/');
    for (const BASE_PATH of ['/..', '/site/../other', '/./site']) {
      assert.throws(() => resolveDeployment({ BASE_PATH }), /BASE_PATH/, BASE_PATH);
    }
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

  it('names the Git Bash hint only for a value that looks like a Windows path', () => {
    assert.throws(
      () => resolveDeployment({ BASE_PATH: '/site?x=1' }),
      (error: Error) => {
        assert.match(error.message, /BASE_PATH/);
        assert.doesNotMatch(error.message, /MSYS_NO_PATHCONV/);
        return true;
      },
    );
  });

  it('rejects a SITE that is not an absolute http(s) URL', () => {
    assert.throws(() => resolveDeployment({ SITE: 'timbencker.github.io' }), /SITE/);
  });
});
