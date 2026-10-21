import { describe, test } from 'vitest'
import { nextTick as nextTickImport } from 'vue'

import { flatText, nestedText } from '../../../utils/src/bench/fixtures'
import { createForm } from '../helpers'

// Module exports are getters under vitest's module runner; locals keep the
// bench loops from paying (and being flagged for) getter overhead per call.
const nextTick = nextTickImport

/**
 * Mounted form-level rollups: one keystroke-sized write followed by reading
 * payload / invalid / errors / empty — today aggregated from mounted element
 * contexts, engine-computed after the refactor. The central A/B signal for
 * the engine-authoritative change.
 */
describe('mounted rollups', () => {
  const flat = createForm({ schema: flatText(200) })
  let i = 0

  test('write one + read rollups, 200 flat mounted', async ({ bench }) => {
    await bench('write one + read rollups, 200 flat mounted', async () => {
      flat.el_0.update(`v${++i}`)
      await nextTick()
      void flat.form$.payload
      void flat.form$.invalid
      void flat.form$.errors
      void flat.form$.empty
    }).run()
  })

  const nested = createForm({ schema: nestedText(100, 3) })
  const deepLeaf = nested['g_0.g_1.g_2.el_0']
  let j = 0

  test('write deep + read rollups, 100 elements 3 groups deep', async ({
    bench,
  }) => {
    await bench('write deep + read rollups, 100 elements 3 groups deep', async () => {
      deepLeaf.update(`v${++j}`)
      await nextTick()
      void nested.form$.payload
      void nested.form$.invalid
      void nested.form$.errors
      void nested.form$.empty
    }).run()
  })
})

describe('attached rollups', () => {
  const host = createForm({ schema: { _host: { type: 'text' } } })
  const model$ = host.vueform.useModel({ schema: flatText(200) as any })
  const attached = createForm({ schema: flatText(200), modelValue: model$ })
  let i = 0

  test('model.set + read form & instance rollups, 200 attached', async ({
    bench,
  }) => {
    await bench('model.set + read form & instance rollups, 200 attached', async () => {
      model$.set('el_0', `v${++i}`)
      await nextTick()
      void attached.form$.payload
      void model$.payload
      void model$.errors
    }).run()
  })
})
