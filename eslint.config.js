import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['dist/', '.astro/', 'node_modules/', 'design/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  // Accessibility rules for .astro templates. Strict rather than recommended:
  // accessibility is an explicit goal for this site, so the stricter set is the
  // right default and exceptions should be argued case by case.
  ...astro.configs['jsx-a11y-strict'],
  {
    // Config files run in Node at build time, not in the browser.
    files: ['**/*.config.{js,mjs,ts}'],
    languageOptions: { globals: { process: 'readonly' } },
  },
];
