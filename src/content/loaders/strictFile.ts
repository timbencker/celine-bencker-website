import { AstroError } from 'astro/errors';
import { file, type Loader, type LoaderContext } from 'astro/loaders';

/**
 * Astro's `file()` loader, made strict: a broken data file stops the build
 * and names the file.
 *
 * On its own, `file()` only logs most problems — a YAML typo, an entry without
 * an `id` — and the build carries on with an empty or partial collection. The
 * page then ships without the list, and nobody notices. This wrapper records
 * what the loader reports and turns it into one error after the first load:
 *
 *   - the store is cleared first: on a parse error `file()` returns before
 *     clearing, so entries cached by an earlier build would ship stale;
 *   - `error()` and `debug()` messages are recorded, because the parser's own
 *     message (with the `(line:column)` position) only goes to `debug()`;
 *   - thrown errors are caught too: a file holding only comments parses to
 *     nothing, and a duplicate `id` throws (with `prerenderConflictBehavior:
 *     'error'` in astro.config.mjs);
 *   - an empty collection is an error unless `allowEmpty` is set.
 *
 * Only the first load may throw. During `astro dev`, `file()` reloads the file
 * whenever it changes, with the same context; nothing would catch an error
 * there, so from then on problems are logged and the server keeps running.
 */

export interface StrictFileOptions {
  /** The file may hold an empty list (`[]`), e.g. while no entry exists yet. */
  allowEmpty?: boolean;
}

type Logger = LoaderContext['logger'];
type Watcher = NonNullable<LoaderContext['watcher']>;

const HINT = 'How the data files are written: README.md → "Inhalte bearbeiten".';

/** A data file the build cannot use. Shown by Astro as `[DataFileError] …` plus the hint. */
class DataFileError extends AstroError {
  name = 'DataFileError';
}

const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error));

/**
 * The same logger, except that `error()` and `debug()` also pass their message
 * to `record` first. Everything else (`fork`, `label`, `options`, …) resolves
 * on the real logger.
 */
function recordingLogger(
  logger: Logger,
  record: (level: 'error' | 'debug', message: string) => void,
): Logger {
  return new Proxy(logger, {
    get(target, prop) {
      if (prop === 'error' || prop === 'debug') {
        return (message: string) => {
          record(prop, message);
          target[prop](message);
        };
      }
      const value: unknown = Reflect.get(target, prop, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}

/**
 * The same watcher, except that change listeners cannot reject: a reload that
 * throws (a duplicate `id`, say) is logged instead of becoming an unhandled
 * rejection in the dev server.
 */
function guardedWatcher(watcher: Watcher, logger: Logger, fileName: string): Watcher {
  return new Proxy(watcher, {
    get(target, prop) {
      const value: unknown = Reflect.get(target, prop, target);
      if (prop !== 'on' || typeof value !== 'function') {
        return typeof value === 'function' ? value.bind(target) : value;
      }
      return (event: string, listener: (...args: unknown[]) => unknown) =>
        value.call(target, event, async (...args: unknown[]) => {
          try {
            await listener(...args);
          } catch (error) {
            logger.error(`Could not reload ${fileName}: ${messageOf(error)}`);
          }
        });
    },
  });
}

export function strictFile(fileName: string, options: StrictFileOptions = {}): Loader {
  const inner = file(fileName);
  let firstLoadDone = false;

  return {
    name: 'strict-file-loader',
    load: async (context) => {
      const isFirstLoad = !firstLoadDone;
      const recorded: { level: 'error' | 'debug'; message: string }[] = [];

      const logger = recordingLogger(context.logger, (level, message) => {
        // After the first load nobody reads the record; stop growing it.
        if (!firstLoadDone) recorded.push({ level, message });
      });
      const wrapped: LoaderContext = {
        ...context,
        logger,
        watcher: context.watcher && guardedWatcher(context.watcher, logger, fileName),
      };

      context.store.clear();
      let thrown: unknown;
      try {
        await inner.load(wrapped);
      } catch (error) {
        thrown = error;
      }
      firstLoadDone = true;

      if (!isFirstLoad) {
        if (thrown !== undefined) {
          logger.error(`Could not load ${fileName}: ${messageOf(thrown)}`);
        }
        return;
      }

      // Debug messages before the first error are progress notes
      // ("Loading data from …"); the ones after it explain the error.
      const firstError = recorded.findIndex((entry) => entry.level === 'error');
      const problems = firstError === -1 ? [] : recorded.slice(firstError).map((e) => e.message);

      if (thrown !== undefined) {
        // Astro's own errors (duplicate id, schema mismatch) carry a `type` and
        // explain themselves. Anything else means the loader tripped over the
        // file's shape, e.g. a file with only comments, which parses to nothing.
        const isAstroError = typeof (thrown as { type?: unknown } | null)?.type === 'string';
        problems.push(
          isAstroError
            ? messageOf(thrown)
            : `The content does not have the expected shape (${messageOf(thrown)}). ` +
                'Each entry starts with `- id:`; a file without entries must contain `[]`.',
        );
      } else if (
        problems.length === 0 &&
        !options.allowEmpty &&
        context.store.keys().length === 0
      ) {
        problems.push('The file holds no entries, but this page needs at least one.');
      }

      if (problems.length > 0) {
        // One bullet per problem; continuation lines (the parser's excerpt of
        // the file) are indented under it.
        const list = problems.map((problem) =>
          problem
            .split('\n')
            .map((line, index) => `${index === 0 ? '  - ' : '    '}${line}`.trimEnd())
            .join('\n'),
        );
        throw new DataFileError(`${fileName} could not be loaded:\n${list.join('\n')}`, HINT);
      }
    },
  };
}
