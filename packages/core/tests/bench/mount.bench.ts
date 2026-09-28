import { bench, describe } from 'vitest'
import { createForm } from '../helpers'
import { flatText, steppedText } from './fixtures'

/**
 * The full schema→mount pipeline: components, model, classes, conditions and
 * validation setup for every element. The dominant fixed cost of a form.
 */
describe('mount', () => {
  bench('flat form, 50 text elements', () => {
    createForm({ schema: flatText(50) })
  })

  bench('flat form, 200 text elements', () => {
    createForm({ schema: flatText(200) })
  })

  bench('stepped form, 100 text elements across 10 steps', () => {
    createForm({ schema: steppedText(100), stepped: true })
  })
})
