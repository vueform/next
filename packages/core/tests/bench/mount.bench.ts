import { describe, test } from 'vitest'

import {
  flatText as flatTextImport,
  listSchema as listSchemaImport,
  nestedText as nestedTextImport,
  steppedText as steppedTextImport,
} from '../../../utils/src/bench/fixtures'
import { createForm as createFormImport } from '../helpers'

// Module exports are getters under vitest's module runner; locals keep the
// bench loops from paying (and being flagged for) getter overhead per call.
const flatText = flatTextImport
const listSchema = listSchemaImport
const nestedText = nestedTextImport
const steppedText = steppedTextImport
const createForm = createFormImport

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

  test('nested form, 100 elements 3 groups deep', async ({ bench }) => {
    await bench('nested form, 100 elements 3 groups deep', () => {
      createForm({ schema: nestedText(100, 3) }).form.unmount()
    }).run({ time: 500 })
  })

  test('list form, 50 rows', async ({ bench }) => {
    await bench('list form, 50 rows', () => {
      createForm({ schema: listSchema(50) }).form.unmount()
    }).run({ time: 500 })
  })

  // Walk + instance creation + mount + attach: the full useModel→form path,
  // and (after the refactor) the cost profile of every form.
  const host = createForm({ schema: { _host: { type: 'text' } } })

  test('flat form, 200 elements, attached useModel', async ({ bench }) => {
    await bench('flat form, 200 elements, attached useModel', () => {
      const schema = flatText(200)
      const model$ = host.vueform.useModel({ schema: schema as any })
      createForm({ schema, modelValue: model$ }).form.unmount()
      model$.destroy()
    }).run({ time: 500 })
  })
})
