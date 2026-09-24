import { expect, test } from '@playwright/test'

/**
 * Core UI element types covered by the tabular matrix screenshots.
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

/**
 * Middle-column filler modes: element (`filler` prop, default textarea) and
 * empty content cell.
 */
const fillerModes = [
  { contentFiller: false, suffix: '' },
  { contentFiller: true, suffix: '-content' },
] as const

type Case = {
  type: string
  combination: number
  stacked: boolean
  contentFiller: boolean
  name: string
}

function buildCases(): Case[] {
  const cases: Case[] = []

  for (const fillerMode of fillerModes) {
    for (const type of allTypes) {
      if (combinationTypes.includes(type)) {
        for (let combination = 0; combination < 16; combination++) {
          cases.push({
            type,
            combination,
            stacked: false,
            contentFiller: fillerMode.contentFiller,
            name: `${type}-c${combination}${fillerMode.suffix}`,
          })
        }
        continue
      }

      if (stackedTypes.includes(type)) {
        for (const stacked of [false, true]) {
          const base = stacked ? `${type}-stacked` : type
          cases.push({
            type,
            combination: 0,
            stacked,
            contentFiller: fillerMode.contentFiller,
            name: `${base}${fillerMode.suffix}`,
          })
        }
        continue
      }

      cases.push({
        type,
        combination: 0,
        stacked: false,
        contentFiller: fillerMode.contentFiller,
        name: `${type}${fillerMode.suffix}`,
      })
    }
  }

  return cases
}

function buildUrl(testCase: Case) {
  const params = new URLSearchParams({
    suite: 'matrix',
    type: testCase.type,
    combination: String(testCase.combination),
  })

  if (testCase.stacked) params.set('stacked', '1')
  if (testCase.contentFiller) params.set('content', '1')

  return `/?${params.toString()}`
}

for (const testCase of buildCases()) {
  test(`matrix: ${testCase.name}`, async ({ page }) => {
    await page.goto(buildUrl(testCase))
    await page.waitForSelector('.tabular-matrix-tester .vf-form', {
      state: 'visible',
    })

    // Allow fonts and async CSS to settle
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot(`matrix-${testCase.name}.png`, {
      fullPage: true,
    })
  })
}
