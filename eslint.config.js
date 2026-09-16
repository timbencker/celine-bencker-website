import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'design/',
      '.worktrees/',
      // Playwright output
      'test-results/',
      'playwright-report/',
      'blob-report/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  // Accessibility rules for .astro templates. Strict rather than recommended:
  // accessibility is an explicit goal for this site, so the stricter set is the
  // right default and exceptions should be argued case by case.
  ...astro.configs['jsx-a11y-strict'],
  {
    // Argued exception: `role="list"` on <ul> is not redundant here. Tailwind's
    // reset sets `list-style: none` on every list, and Safari/VoiceOver then
    // stops announcing it as a list. The explicit role restores that.
    files: ['**/*.astro'],
    rules: {
      'astro/jsx-a11y/no-redundant-roles': ['error', { nav: ['navigation'], ul: ['list'] }],
    },
  },
  {
    // Config files run in Node at build time, not in the browser.
    files: ['**/*.config.{js,mjs,ts}'],
    languageOptions: { globals: { process: 'readonly' } },
  },
];
