import { describe, test } from 'vitest'
import { createForm } from '../helpers'
import { flatText, steppedText } from './fixtures'

/**
 * The full schema→mount pipeline: components, model, classes, conditions and
 * validation setup for every element. The dominant fixed cost of a form.
 */
describe('mount', () => {
  test('flat form, 50 text elements', async ({ bench }) => {
    await bench('flat form, 50 text elements', () => {
      createForm({ schema: flatText(50) }).form.unmount()
    }).run({ time: 500 })
  })

  test('flat form, 200 text elements', async ({ bench }) => {
    await bench('flat form, 200 text elements', () => {
      createForm({ schema: flatText(200) }).form.unmount()
    }).run({ time: 500 })
  })

  test('stepped form, 100 text elements across 10 steps', async ({ bench }) => {
    await bench('stepped form, 100 text elements across 10 steps', () => {
      createForm({ schema: steppedText(100), stepped: true }).form.unmount()
    }).run({ time: 500 })
  })
})
