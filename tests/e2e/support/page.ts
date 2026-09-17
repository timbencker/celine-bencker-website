import type { Page } from '@playwright/test';

import type { Route } from './site';

/** Opens a route and waits for its web fonts, so layout checks see final text metrics. */
export async function open(page: Page, route: Pick<Route, 'url'>) {
  const response = await page.goto(route.url);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  return response;
}

/** A failure message with one problem per line. */
export function report(title: string, problems: string[]): string {
  return `${title}:\n${problems.map((problem) => `  - ${problem}`).join('\n')}`;
}
