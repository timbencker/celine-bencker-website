import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assertNoIgnoredBodies } from '../../src/content/checks.ts';

/**
 * Page files keep their text in front matter blocks; a page whose view is
 * registered in src/views/registry.ts never renders the Markdown body. Text
 * written there would silently disappear, so the build stops instead.
 */

const page = (id: string, translationKey: string, body?: string) => ({
  entry: { id, body },
  translationKey,
});

describe('assertNoIgnoredBodies', () => {
  const rendered = ['home', 'research', 'contact'];

  it('passes when pages with their own view have no body', () => {
    assert.doesNotThrow(() =>
      assertNoIgnoredBodies(
        [
          page('de/index', 'home', ''),
          page('de/forschung', 'research', '\n  \n'),
          page('de/x', 'contact'),
        ],
        rendered,
      ),
    );
  });

  it('allows a body on pages without their own view (the draft view renders it)', () => {
    assert.doesNotThrow(() =>
      assertNoIgnoredBodies([page('de/neu', 'new-page', 'Hier steht Text.')], rendered),
    );
  });

  it('fails on every page whose body would be dropped, naming each file', () => {
    assert.throws(
      () =>
        assertNoIgnoredBodies(
          [
            page('de/kontakt', 'contact', 'Ein Satz unter dem Kopfbereich.'),
            page('en/research', 'research', 'Some text.'),
            page('de/index', 'home', ''),
          ],
          rendered,
        ),
      (error: Error) => {
        assert.match(error.message, /de\/kontakt\.md/);
        assert.match(error.message, /en\/research\.md/);
        assert.doesNotMatch(error.message, /de\/index\.md/);
        assert.match(error.message, /README/);
        return true;
      },
    );
  });
});
