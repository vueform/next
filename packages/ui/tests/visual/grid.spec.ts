import { expect, test } from '@playwright/test'

/**
 * Core UI element types covered by the tabular grid screenshots.
 */
const allTypes = [
  'button',
  'checkbox',
  'checkboxes',
  'content',
  'field',
  'radio',
  'radios',
  'select',
  'text',
  'textarea',
]

/**
 * Types that exercise all 16 icon/addon combinations.
 */
const combinationTypes = ['text', 'textarea', 'select']

/**
 * Types that exercise stacked on / off.
 */
const stackedTypes = ['checkboxes', 'radios']

type Case = {
  type: string
  combination: number
  stacked: boolean
  name: string
}

function buildCases(): Case[] {
  const cases: Case[] = []

  for (const type of allTypes) {
    if (combinationTypes.includes(type)) {
      for (let combination = 0; combination < 16; combination++) {
        cases.push({
          type,
          combination,
          stacked: false,
          name: `${type}-c${combination}`,
        })
      }
      continue
    }

    if (stackedTypes.includes(type)) {
      for (const stacked of [false, true]) {
        cases.push({
          type,
          combination: 0,
          stacked,
          name: stacked ? `${type}-stacked` : type,
        })
      }
      continue
    }

    cases.push({
      type,
      combination: 0,
      stacked: false,
      name: type,
    })
  }

  return cases
}

function buildUrl(testCase: Case) {
  const params = new URLSearchParams({
    suite: 'grid',
    type: testCase.type,
    combination: String(testCase.combination),
  })

  if (testCase.stacked) params.set('stacked', '1')

  return `/?${params.toString()}`
}

for (const testCase of buildCases()) {
  test(`grid: ${testCase.name}`, async ({ page }) => {
    await page.goto(buildUrl(testCase))
    await page.waitForSelector('.tabular-grid-tester .vf-form', {
      state: 'visible',
    })

    // Allow fonts and async CSS to settle
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot(`grid-${testCase.name}.png`, {
      fullPage: true,
    })
  })
}
