import { defineSchema } from '@vueform/core'
import { nextTick } from 'vue'

import { createForm } from '../../helpers'

const cols = [
  { value: 'col_1', label: 'Col 1' },
  { value: 'col_2', label: 'Col 2' },
]

// =============================================================================
// MATRIX SEMANTICS
// =============================================================================
describe('VfMatrix a11y', () => {
  it('should label dynamic-row remove buttons by 1-based row index', async () => {
    const { form } = createForm({
      schema: defineSchema({
        matrix: { type: 'matrix', cols, rows: 2 },
      }),
    })

    await nextTick()

    expect(form.find('button[aria-label="Remove row 1"]').exists()).toBe(true)
    expect(form.find('button[aria-label="Remove row 2"]').exists()).toBe(true)
    expect(form.find('button[aria-label="Remove row 3"]').exists()).toBe(false)
  })

  it('should label every cell input by two existing row/column header ids', async () => {
    const { form } = createForm({
      schema: defineSchema({
        matrix: { type: 'matrix', cols, rows: 2 },
      }),
    })

    await nextTick()

    const inputs = form
      .findAll('input, select, textarea')
      .filter((input) => !!input.attributes('aria-labelledby'))

    // Two rows x two cols of cells.
    expect(inputs).toHaveLength(4)

    inputs.forEach((input) => {
      const ids = input.attributes('aria-labelledby')!.split(' ')
      expect(ids).toHaveLength(2)

      ids.forEach((id) => {
        const target = form.find(`[id="${id}"]`)
        expect(target.exists()).toBe(true)
        expect(target.text().length).toBeGreaterThan(0)
      })
    })
  })
})
