/**
 * Interaction stage: the canonical interaction, identical in every env: submit with the
 * required field empty (validation error appears), fill it, submit again
 * (payload arrives), plus the runtime mirror of the find() type assertion.
 */
import { expect, test } from '@playwright/test'

import { watchConsole } from './helpers.mjs'

test('validates, submits, and finds elements at runtime', async ({ page }) => {
  const consoleWatch = watchConsole(page)

  await page.goto('/')
  await page.waitForFunction(() => Boolean(window.__smoke))

  const schemaForm = page.locator('[data-smoke="schema-form"]')
  const submit = schemaForm.getByRole('button', { name: 'Submit' })

  // Required field empty → validation error, no submit payload.
  await submit.click()
  await expect(schemaForm.locator('.vf-error').first()).toBeVisible()
  await expect(schemaForm.locator('.vf-error').first()).toContainText(
    /required/i
  )
  expect(await page.evaluate(() => window.__smoke.submitted)).toBeNull()

  // Fill it → the error clears and the payload arrives.
  await schemaForm.locator('input[name="text"]').fill('hello world')
  await submit.click()

  await expect
    .poll(async () => page.evaluate(() => window.__smoke.submitted))
    .toMatchObject({ text: 'hello world' })
  await expect(schemaForm.locator('.vf-error')).toHaveCount(0)

  // Runtime mirror of the tier-1 find() assertion.
  expect(await page.evaluate(() => window.__smoke.findsText())).toBe(true)

  consoleWatch.assertClean()
})
