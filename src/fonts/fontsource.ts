import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import type { FontProvider } from 'astro';

/**
 * A font provider for Astro's fonts API that reads installed Fontsource
 * packages from node_modules.
 *
 * Astro's built-in providers do not fit:
 * - `npm` rewrites the installed files to jsDelivr URLs and downloads them
 *   during the build.
 * - `local` does not record which subset a file holds, so a preload cannot pick
 *   the Latin file alone.
 *
 * This one needs no network and tags every face with its subset.
 */
export interface FontsourceOptions {
  /** The installed package, e.g. `@fontsource-variable/manrope`. */
  package: string;
}

interface Metadata {
  id: string;
  subsets: string[];
  weights: number[];
  styles: string[];
  variable: false | { wght?: { min: string; max: string } };
}

export function fontsource(): FontProvider<FontsourceOptions> {
  let require = createRequire(import.meta.url);

  return {
    name: 'fontsource-local',
    init({ root }) {
      require = createRequire(root);
    },
    resolveFont({ familyName, weights, styles, subsets, options }) {
      if (!options?.package) throw new Error(`Font family "${familyName}": set options.package.`);
      const pkg = options.package;
      const dir = dirname(require.resolve(`${pkg}/package.json`));
      const read = (file: string) => JSON.parse(readFileSync(join(dir, file), 'utf8'));
      const metadata: Metadata = read('metadata.json');
      const ranges: Record<string, string> = read('unicode.json');

      // A variable font has one file per subset and style, covering every weight.
      const wght = metadata.variable ? metadata.variable.wght : undefined;
      const faces = wght
        ? [{ weight: `${wght.min} ${wght.max}`, file: 'wght' }]
        : metadata.weights
            .map(String)
            .filter((weight) => weights.includes(weight))
            .map((weight) => ({ weight, file: weight }));

      const fonts = subsets.flatMap((subset) => {
        if (!metadata.subsets.includes(subset)) {
          throw new Error(`${pkg} has no subset "${subset}".`);
        }
        return styles
          .filter((style) => metadata.styles.includes(style))
          .flatMap((style) =>
            faces.map(({ weight, file }) => {
              const path = join(dir, 'files', `${metadata.id}-${subset}-${file}-${style}.woff2`);
              if (!existsSync(path)) throw new Error(`Font file missing: ${path}`);
              return {
                src: [{ url: path, format: 'woff2' }],
                weight,
                style,
                unicodeRange: ranges[subset]!.split(','),
                meta: { subset },
              };
            }),
          );
      });

      return { fonts };
    },
  };
}
