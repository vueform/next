/**
 * Boot stage: the app loads with a clean console, every canonical schema
 * element actually rendered (in both the schema-driven and the
 * inline-components form), SSR envs serve real server-rendered markup and
 * hydrate without mismatches, and vapor envs actually run vapor.
 */
import { expect, test } from '@playwright/test'

import { runInfo, watchConsole } from './helpers.mjs'

const info = runInfo()

test('boots with a clean console and renders every element', async ({
  page,
}) => {
  const consoleWatch = watchConsole(page)

  await page.goto('/')
  await page.waitForFunction(() => Boolean(window.__smoke))

  const schemaForm = page.locator('[data-smoke="schema-form"]')
  const inlineForm = page.locator('[data-smoke="inline-form"]')

  // Schema form: every canonical family mounted, asked through the form's
  // own API (find) — what an element RENDERS as is the adapter's business,
  // so the spec makes no markup assumptions beyond the two elements the
  // interaction spec actually drives (the text input and the submit
  // button).
  for (const key of [
    'text',
    'select',
    'checkboxes',
    'group',
    'list',
    'submit',
  ]) {
    expect(
      await page.evaluate((k) => window.__smoke.finds(k), key),
      `form$.find('${key}')`
    ).toBe(true)
  }
  await expect(schemaForm.locator('input[name="text"]')).toBeVisible()
  await expect(schemaForm.getByRole('button', { name: 'Submit' })).toBeVisible()

  // Inline form: global components render without any imports — same
  // minimal DOM bet, the text control only. Unresolved components would
  // additionally fail the clean-console assertion below.
  await expect(inlineForm.locator('input[name="text"]')).toBeVisible()

  consoleWatch.assertClean()
})

test('exposes the smoke handle', async ({ page }) => {
  await page.goto('/')
  await page.waitForFunction(() => Boolean(window.__smoke))

  if (info.mode === 'vapor') {
    // Guard against a silent vdom fallback: a vapor env that renders fine
    // but not in vapor mode must fail, not pass vacuously.
    expect(await page.evaluate(() => window.__smoke.vaporActive)).toBe(true)
  }
})

test('server-renders the form markup', async ({ request }) => {
  test.skip(info.rendering !== 'ssr', 'SSR envs only')

  // The raw HTML response, before any client JS: the form must be there.
  const response = await request.get('/')
  expect(response.ok()).toBe(true)

  const html = await response.text()
  expect(html).toContain('data-smoke="schema-form"')
  expect(html).toContain('name="text"')
})
