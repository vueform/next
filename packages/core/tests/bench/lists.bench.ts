import { describe, test } from 'vitest'
import { nextTick as nextTickImport } from 'vue'

import {
  listSchema,
  listValues as listValuesImport,
} from '../../../utils/src/bench/fixtures'
import { createForm } from '../helpers'

// Module exports are getters under vitest's module runner; locals keep the
// bench loops from paying (and being flagged for) getter overhead per call.
const nextTick = nextTickImport
const listValues = listValuesImport

/**
 * Dynamic list row churn: mounted add/remove, row-count changes through
 * load(), and headless array-length swaps — the paths the index row
 * reconciliation work makes hot (every array write gains a length check,
 * rows gain index nodes).
 */
describe('lists', () => {
  const mounted = createForm({ schema: listSchema(50) })

  test('add + remove a row, 50-row mounted list', async ({ bench }) => {
    await bench('add + remove a row, 50-row mounted list', async () => {
      mounted.items.add()
      await nextTick()
      mounted.items.remove(50)
      await nextTick()
    }).run({ time: 500 })
  })

  const loaded = createForm({ schema: listSchema(50) })
  let grow = false

  test('load alternating 40/60 rows into a 50-row list', async ({ bench }) => {
    await bench('load alternating 40/60 rows into a 50-row list', async () => {
      grow = !grow
      await loaded.form$.load({ items: listValues(grow ? 60 : 40) })
      await nextTick()
    }).run({ time: 500 })
  })

  const host = createForm({ schema: { _host: { type: 'text' } } })
  const model$ = host.vueform.useModel({ schema: listSchema(50) as any })
  let headlessGrow = false

  test('headless array length swap 40/60 rows', async ({ bench }) => {
    await bench('headless array length swap 40/60 rows', () => {
      headlessGrow = !headlessGrow
      model$.set('items', listValues(headlessGrow ? 60 : 40))
      void model$.payload
      void model$.empty
    }).run({ time: 500 })
  })
})
