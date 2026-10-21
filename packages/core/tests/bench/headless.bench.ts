import { describe, test } from 'vitest'
import { nextTick as nextTickImport, ref } from 'vue'

import {
  allValues as allValuesImport,
  flatText as flatTextImport,
  listSchema as listSchemaImport,
  nestedText as nestedTextImport,
} from '../../../utils/src/bench/fixtures'
import { createForm } from '../helpers'

// Module exports are getters under vitest's module runner; locals keep the
// bench loops from paying (and being flagged for) getter overhead per call.
const nextTick = nextTickImport
const allValues = allValuesImport
const flatText = flatTextImport
const listSchema = listSchemaImport
const nestedText = nestedTextImport

/**
 * The headless engine: instance creation (schema walk + engine wiring),
 * headless validate, rollup reads after writes, and reactive-schema
 * reconciliation. These are the paths the engine-authoritative refactor
 * makes load-bearing for every form.
 */

const { vueform } = createForm({ schema: { _host: { type: 'text' } } })

function validatedSchema(n: number) {
  const schema = flatText(n)
  Object.values(schema).forEach((element) => {
    element.rules = 'required|min:2|max:255'
  })
  return schema
}

describe('headless creation', () => {
  test('create instance, 200 flat elements', async ({ bench }) => {
    await bench('create instance, 200 flat elements', () => {
      vueform.useModel({ schema: flatText(200) as any }).destroy()
    }).run({ time: 500 })
  })

  test('create instance, 100 elements nested 3 groups deep', async ({
    bench,
  }) => {
    await bench('create instance, 100 elements nested 3 groups deep', () => {
      vueform.useModel({ schema: nestedText(100, 3) as any }).destroy()
    }).run({ time: 500 })
  })

  test('create instance, list of 50 rows', async ({ bench }) => {
    await bench('create instance, list of 50 rows', () => {
      vueform.useModel({ schema: listSchema(50) as any }).destroy()
    }).run({ time: 500 })
  })
})

describe('headless validate', () => {
  const model$ = vueform.useModel({ schema: validatedSchema(100) as any })

  // Staleness-aware like the mounted path: write fresh values first so every
  // iteration measures a full update-then-revalidate pass.
  test('update and validate 100 elements headlessly', async ({ bench }) => {
    await bench('update and validate 100 elements headlessly', async () => {
      model$.update(allValues(100))
      await model$.validate()
    }).run()
  })
})

describe('headless rollups', () => {
  const model$ = vueform.useModel({ schema: flatText(200) as any })
  let i = 0

  test('write one + read payload/empty/errors, 200 elements', async ({
    bench,
  }) => {
    await bench('write one + read payload/empty/errors, 200 elements', () => {
      model$.set('el_0', `v${++i}`)
      void model$.payload
      void model$.empty
      void model$.errors
    }).run()
  })
})

describe('reactive schema', () => {
  // Two 200-element schemas sharing 150 paths: each swap adds 50, removes 50,
  // and reconciles the 150 survivors in place.
  const schemaA = flatText(200)
  const schemaB: Record<string, Record<string, unknown>> = {}
  for (let i = 50; i < 250; i++) {
    schemaB[`el_${i}`] = { type: 'text', label: `Field ${i}` }
  }

  const schemaRef = ref<any>(schemaA)
  const model$ = vueform.useModel({ schema: schemaRef })
  void model$
  let toggle = false

  test('reconcile swap: 50 added, 50 removed, 150 kept', async ({ bench }) => {
    await bench('reconcile swap: 50 added, 50 removed, 150 kept', async () => {
      toggle = !toggle
      schemaRef.value = toggle ? schemaB : schemaA
      await nextTick()
    }).run({ time: 500 })
  })
})
