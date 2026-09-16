import { randomUUID } from 'node:crypto';

import { defineConfig } from '@playwright/test';

import { BASE_URL, E2E_PORT } from './tests/e2e/support/site';

/**
 * Accessibility and integrity suite. See tests/README.md.
 *
 * One build per run: the webServer builds, then serves `dist/` on E2E_PORT
 * (default 4330). Parallel agents each use their own port.
 *
 * The server can never be someone else's: `reuseExistingServer` is off, the
 * serve script refuses a taken port instead of moving to the next one, and
 * Playwright waits for a file stamped with this run's id — a server from
 * another run, checkout or port cannot answer that URL.
 */

// Set once in the main process; worker processes inherit it.
process.env.E2E_RUN_ID ??= randomUUID();
const runId = process.env.E2E_RUN_ID;

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/e2e-results.json' }],
  ],
  globalSetup: './tests/e2e/support/global-setup.ts',

  use: {
    baseURL: BASE_URL,
    // The installed Google Chrome. The suite never downloads a browser.
    channel: 'chrome',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'off',
  },

  projects: [{ name: 'chrome' }],

  webServer: {
    command: 'npm run build && node tests/e2e/support/serve.ts',
    url: `${BASE_URL}_e2e/${runId}.txt`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      E2E_PORT: String(E2E_PORT),
      E2E_RUN_ID: runId,
      ASTRO_TELEMETRY_DISABLED: '1',
    },
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
