import { expect, test } from '@playwright/test'

test('primevue playground matches screenshot', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('.container .vf-form', { state: 'visible' })

  // Allow fonts and async CSS to settle
  await page.waitForTimeout(500)

  await expect(page).toHaveScreenshot('primevue-playground.png', {
    fullPage: true,
  })
})
