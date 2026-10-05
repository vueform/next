import { describe, test } from 'vitest'
import { nextTick } from 'vue'
import { createForm } from '../helpers'

/**
 * Expression templates (`{a + b}` via the exprEval plugin): the parse-heavy
 * mount of a form full of computed defaults, and the re-evaluation cost when a
 * dependency every expression references changes.
 */

function expressionSchema(n: number) {
  const schema: Record<string, Record<string, unknown>> = {
    base: { type: 'text', default: 1 },
  }

  for (let i = 0; i < n; i++) {
    schema[`calc_${i}`] = {
      type: 'text',
      label: `Calc ${i}`,
      default: `{base * ${i + 1}}`,
    }
  }

  return schema
}

describe('expressions', () => {
  test('mount 50 expression elements', async ({ bench }) => {
    await bench('mount 50 expression elements', () => {
      createForm({ schema: expressionSchema(50) })
    }).run()
  })

  const { base } = createForm({ schema: expressionSchema(50) })
  let value = 1

  test('update the dependency of 50 expressions', async ({ bench }) => {
    await bench('update the dependency of 50 expressions', async () => {
      base.update(++value)
      await nextTick()
    }).run()
  })
})
