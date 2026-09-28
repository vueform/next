/**
 * Tier 2 — boot. The app loads with a clean console, every canonical schema
 * element actually rendered (in both the schema-driven and the
 * inline-components form), SSR cells serve real server-rendered markup and
 * hydrate without mismatches, and vapor cells actually run vapor.
 */
import { expect, test } from '@playwright/test'
import { runInfo, watchConsole } from './helpers.mjs'

const info = runInfo()

test('boots with a clean console and renders every element', async ({
  page,
}) => {
  const consoleWatch = watchConsole(page)

  await page.goto('/')

  const schemaForm = page.locator('[data-smoke="schema-form"]')
  const inlineForm = page.locator('[data-smoke="inline-form"]')

  // Schema form: one assertion per canonical element (registry family).
  // Selectors are adapter-neutral: text controls render native inputs with
  // the schema key as name, and both a native <select> and PrimeVue's
  // div-based Select expose role=combobox.
  await expect(schemaForm.locator('input[name="text"]')).toBeVisible()
  await expect(schemaForm.getByRole('combobox')).toBeVisible()
  await expect(schemaForm.locator('input[type="checkbox"]')).toHaveCount(2)
  await expect(schemaForm.locator('input[name="city"]')).toBeVisible()
  await expect(schemaForm.locator('input[name="entry"]')).toBeVisible()
  await expect(schemaForm.getByRole('button', { name: 'Submit' })).toBeVisible()

  // Inline form: global components render without any imports.
  await expect(inlineForm.locator('input[name="text"]')).toBeVisible()
  await expect(inlineForm.getByRole('combobox')).toBeVisible()
  await expect(inlineForm.locator('input[type="checkbox"]')).toHaveCount(2)

  consoleWatch.assertClean()
})

test('exposes the smoke handle', async ({ page }) => {
  await page.goto('/')
  await page.waitForFunction(() => Boolean(window.__smoke))

  if (info.mode === 'vapor') {
    // Guard against a silent vdom fallback: a vapor cell that renders fine
    // but not in vapor mode must fail, not pass vacuously.
    expect(await page.evaluate(() => window.__smoke.vaporActive)).toBe(true)
  }
})

test('server-renders the form markup', async ({ request }) => {
  test.skip(info.rendering !== 'ssr', 'SSR cells only')

  // The raw HTML response, before any client JS: the form must be there.
  const response = await request.get('/')
  expect(response.ok()).toBe(true)

  const html = await response.text()
  expect(html).toContain('data-smoke="schema-form"')
  expect(html).toContain('name="text"')
})
