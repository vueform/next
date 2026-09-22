/**
 * Validation benches for the large-list case: container-level rules on a list
 * run against the full list value, which makes them the worst case for the
 * staleness machinery — every keystroke inside the list marks the container's
 * results stale (store write notification) and re-validates them, and the
 * `validated` projections re-aggregate.
 *
 * - container validate — only the list's own rules run (children pre-filled and
 *   completed), isolating the container-rule + staleness cost
 * - full validate — list rules plus all row rules (guards the synchronous fast
 *   path: no per-unit await for sync rules)
 * - keystroke w/ container rules — `validateOn: change`: each input marks the row
 *   and container stale, re-validates both, and re-reads `validated`
 * - keystroke w/o container rules — contrast: leaf-only validation
 */
import { afterAll, bench, describe } from 'vitest'
import { nextTick } from 'vue'
import { createForm } from '../../../helpers'

const ROWS = 200

function ruledListSchema(rows: number, rules?: string) {
  return {
    list: {
      type: 'list',
      wrap: false,
      initial: rows,
      ...(rules ? { rules } : {}),
      schema: {
        text: { type: 'text', rules: 'required' },
      },
    },
  }
}

function filledRows(rows: number) {
  return {
    list: Array.from({ length: rows }, (_, i) => ({ text: `row ${i}` })),
  }
}

function createListForm(rules?: string) {
  return createForm(
    {
      schema: ruledListSchema(ROWS, rules),
      validateOn: ['change'],
    },
    { $conditions: { debounce: 0 } }
  )
}

describe('validation-list', () => {
  const ruled = createListForm('min:1|max:500')
  const plain = createListForm()
  const fullRuled = createListForm('min:1|max:500')

  // Pre-fill so row rules pass: the container-only benches then skip the
  // completed children and measure just the list's own rules.
  ruled.form$.update(filledRows(ROWS))
  plain.form$.update(filledRows(ROWS))

  afterAll(() => {
    ruled.form.unmount()
    plain.form.unmount()
    fullRuled.form.unmount()
  })

  let i = 0

  bench('container validate (rows filled) rows=200', async () => {
    await ruled.list.validate()
    void ruled.list.validated
  })

  bench('full validate (rows empty) rows=200', async () => {
    await fullRuled.list.validate()
    void fullRuled.list.validated
  })

  bench('keystroke w/ container rules rows=200', async () => {
    ruled.form$.find('list.0.text').update(`v${i++}`)
    await nextTick()
    void ruled.list.validated
    void ruled.form$.validated
  })

  bench('keystroke w/o container rules rows=200', async () => {
    plain.form$.find('list.0.text').update(`v${i++}`)
    await nextTick()
    void plain.list.validated
    void plain.form$.validated
  })
})
