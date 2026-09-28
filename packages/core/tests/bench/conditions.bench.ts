import { bench, describe } from 'vitest'
import { nextTick } from 'vue'
import { createForm } from '../helpers'
import { flatText } from './fixtures'

/**
 * Structured conditions: the setup cost of a form where every element depends
 * on one driver field, and the re-evaluation cost of toggling that driver
 * (every condition in the form re-runs).
 */

function conditionalSchema(n: number) {
  const schema = flatText(n + 1)

  Object.entries(schema).forEach(([name, element], i) => {
    if (name !== 'el_0') {
      element.conditions = [['el_0', '==', i % 2 ? 'yes' : 'no']]
    }
  })

  return schema
}

describe('conditions', () => {
  bench('mount 100 elements with conditions', () => {
    createForm(
      { schema: conditionalSchema(100) },
      { $conditions: { debounce: 0 } }
    )
  })

  const { el_0 } = createForm(
    { schema: conditionalSchema(100) },
    { $conditions: { debounce: 0 } }
  )
  let toggle = false

  bench('toggle the driver of 100 conditions', async () => {
    toggle = !toggle
    el_0.update(toggle ? 'yes' : 'no')
    await nextTick()
  })
})
