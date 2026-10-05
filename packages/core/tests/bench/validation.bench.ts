import { describe, test } from 'vitest'
import { createForm } from '../helpers'
import { allValues, flatText } from './fixtures'

/**
 * Validation: rule-string parsing and compilation at mount, and a full-form
 * validate() run over stacked rules.
 */

function validatedSchema(n: number) {
  const schema = flatText(n)

  Object.values(schema).forEach((element) => {
    element.rules = 'required|min:2|max:255'
  })

  return schema
}

describe('validation', () => {
  test('mount 100 elements with rule strings', async ({ bench }) => {
    await bench('mount 100 elements with rule strings', () => {
      createForm({ schema: validatedSchema(100) })
    }).run()
  })

  const { form$ } = createForm({ schema: validatedSchema(100) })

  // Validation is staleness-aware — an unchanged element won't re-run its
  // rules — so each iteration writes fresh values first, measuring the full
  // update-then-revalidate pass.
  test('update and validate 100 elements', async ({ bench }) => {
    await bench('update and validate 100 elements', async () => {
      form$.update(allValues(100))
      await form$.validate()
    }).run()
  })
})
