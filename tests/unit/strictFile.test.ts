import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { pathToFileURL } from 'node:url';

import { strictFile } from '../../src/content/loaders/strictFile.ts';

/**
 * The strict data loader (src/content/loaders/strictFile.ts) around Astro's
 * `file()` loader. Astro's own loader only logs when a data file is broken and
 * the build carries on with an empty collection; this one stops the build and
 * names the file.
 *
 * Each case writes its YAML to a temporary folder and runs the loader against
 * a minimal stand-in for Astro's loader context.
 */

type Logged = Record<'error' | 'warn' | 'info' | 'debug', string[]>;
type ChangeListener = (path: string) => Promise<void> | void;

function setup(files: Record<string, string>, options: { conflicts?: 'error' | 'warn' } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'strict-file-'));
  for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content);

  const entries = new Map<string, unknown>();
  const logged: Logged = { error: [], warn: [], info: [], debug: [] };
  const listeners: ChangeListener[] = [];

  const logger = {
    label: 'test',
    options: {},
    error: (message: string) => void logged.error.push(message),
    warn: (message: string) => void logged.warn.push(message),
    info: (message: string) => void logged.info.push(message),
    debug: (message: string) => void logged.debug.push(message),
    fork: () => logger,
  };

  const context = {
    collection: 'test',
    logger,
    config: {
      root: pathToFileURL(`${dir}/`),
      prerenderConflictBehavior: options.conflicts ?? 'error',
    },
    store: {
      clear: () => entries.clear(),
      set: ({ id, data }: { id: string; data: unknown }) => {
        entries.set(id, data);
        return true;
      },
      get: (id: string) => entries.get(id),
      has: (id: string) => entries.has(id),
      delete: (id: string) => entries.delete(id),
      keys: () => [...entries.keys()],
      values: () => [...entries.values()],
      entries: () => [...entries.entries()],
      addModuleImport: () => {},
    },
    parseData: async ({ data }: { data: unknown }) => data,
    generateDigest: (data: unknown) => JSON.stringify(data),
    meta: new Map<string, string>(),
    watcher: {
      add: () => {},
      on: (event: string, listener: ChangeListener) => {
        if (event === 'change') listeners.push(listener);
      },
    },
  };

  return { dir, context, entries, logged, listeners };
}

// The stand-in covers what the file loader uses, not the whole LoaderContext type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const load = (loader: ReturnType<typeof strictFile>, context: any) => loader.load(context);

describe('strictFile', () => {
  it('loads a valid list', async () => {
    const { context, entries } = setup({
      'talks.yaml': '- id: a\n  title: A\n- id: b\n  title: B\n',
    });
    await load(strictFile('./talks.yaml'), context);
    assert.deepEqual([...entries.keys()], ['a', 'b']);
  });

  it('fails on a YAML syntax error, naming the file and quoting the parser', async () => {
    const { context } = setup({ 'publications.yaml': '- id: a\n  title: "unclosed\n- id: b\n' });
    await assert.rejects(load(strictFile('./publications.yaml'), context), (error: Error) => {
      assert.match(error.message, /publications\.yaml/);
      // js-yaml reports the position as (line:column).
      assert.match(error.message, /\(\d+:\d+\)|line \d+/i);
      return true;
    });
  });

  it('clears entries a previous build left behind before reading', async () => {
    const { context, entries } = setup({ 'publications.yaml': 'id: [unclosed\n' });
    entries.set('stale', { from: 'an earlier build' });
    await assert.rejects(load(strictFile('./publications.yaml'), context));
    assert.equal(entries.size, 0);
  });

  it('fails when an entry has no id', async () => {
    const { context } = setup({ 'cv.yaml': '- id: a\n- title: no id here\n' });
    await assert.rejects(load(strictFile('./cv.yaml'), context), (error: Error) => {
      assert.match(error.message, /cv\.yaml/);
      assert.match(error.message, /id/);
      return true;
    });
  });

  it('fails on a duplicate id, naming the file', async () => {
    const { context } = setup({ 'talks.yaml': '- id: same\n- id: same\n' });
    await assert.rejects(load(strictFile('./talks.yaml'), context), (error: Error) => {
      assert.match(error.message, /talks\.yaml/);
      assert.match(error.message, /same/);
      return true;
    });
  });

  it('fails on a file that holds only comments, naming the file', async () => {
    const { context } = setup({ 'media.yaml': '# nothing here yet\n' });
    await assert.rejects(
      load(strictFile('./media.yaml', { allowEmpty: true }), context),
      /media\.yaml/,
    );
  });

  it('fails on an empty list unless the collection may be empty', async () => {
    const strict = setup({ 'news.yaml': '[]\n' });
    await assert.rejects(load(strictFile('./news.yaml'), strict.context), /news\.yaml/);

    const lenient = setup({ 'media.yaml': '# none yet\n[]\n' });
    await load(strictFile('./media.yaml', { allowEmpty: true }), lenient.context);
    assert.equal(lenient.entries.size, 0);
  });

  it('fails when the file does not exist', async () => {
    const { context } = setup({});
    await assert.rejects(load(strictFile('./missing.yaml'), context), /missing\.yaml/);
  });

  it('keeps the entries of the last good load when a later load breaks', async () => {
    const { dir, context, entries } = setup({ 'talks.yaml': '- id: a\n  title: A\n' });
    const loader = strictFile('./talks.yaml');
    await load(loader, context);

    writeFileSync(join(dir, 'talks.yaml'), '- id: a\n  title: "unclosed\n');
    await assert.doesNotReject(load(loader, context));
    assert.deepEqual([...entries.keys()], ['a'], 'the collection is not emptied');
  });

  it('only logs when a file breaks after the first load (astro dev)', async () => {
    const { dir, context, logged, listeners } = setup({ 'talks.yaml': '- id: a\n' });
    await load(strictFile('./talks.yaml'), context);
    assert.equal(listeners.length, 1, 'the file loader watches the file');

    writeFileSync(join(dir, 'talks.yaml'), '- id: a\n  title: "unclosed\n');
    await assert.doesNotReject(async () => listeners[0]!(join(dir, 'talks.yaml')));
    assert.ok(logged.error.length > 0, 'the problem is still reported');
  });
});
