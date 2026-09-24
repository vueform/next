import { expect, test } from '@playwright/test'

const allTypes = [
  'auto-complete',
  'button',
  'cascade-select',
  'checkbox',
  'checkbox-group',
  'color-picker',
  'content',
  'date-picker',
  'editor',
  'field',
  'file-upload',
  'input-mask',
  'input-number',
  'input-otp',
  'input-text',
  'knob',
  'multi-select',
  'password',
  'radio-button',
  'radio-button-group',
  'rating',
  'select',
  'select-button',
  'slider',
  'textarea',
  'toggle-button',
  'toggle-switch',
  'tree-select',
]

/**
 * Types that exercise all 16 icon/addon combinations.
 */
const combinationTypes = [
  'auto-complete',
  'cascade-select',
  'date-picker',
  'input-mask',
  'input-number',
  'input-text',
  'multi-select',
  'password',
  'select',
  'textarea',
  'tree-select',
]

/**
 * Types that exercise stacked on / off.
 */
const stackedTypes = ['checkbox-group', 'radio-button-group']

/**
 * Types that exercise basic mode on / off.
 */
const basicTypes = ['file-upload']

type Case = {
  type: string
  combination: number
  stacked: boolean
  basic: boolean
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
          basic: false,
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
          basic: false,
          name: stacked ? `${type}-stacked` : type,
        })
      }
      continue
    }

    if (basicTypes.includes(type)) {
      for (const basic of [false, true]) {
        cases.push({
          type,
          combination: 0,
          stacked: false,
          basic,
          name: basic ? `${type}-basic` : type,
        })
      }
      continue
    }

    cases.push({
      type,
      combination: 0,
      stacked: false,
      basic: false,
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
  if (testCase.basic) params.set('basic', '1')

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
