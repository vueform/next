import { describe, test } from 'vitest'
import { nextTick } from 'vue'
import { createForm } from '../helpers'
import { allValues, flatText } from './fixtures'

/**
 * The write paths on a mounted form: replacing every value at once (`update`),
 * loading data, and a single element's update — the operation behind every
 * keystroke.
 */
describe('model', () => {
  const { form$ } = createForm({ schema: flatText(200) })

  test('update all 200 values at once', async ({ bench }) => {
    await bench('update all 200 values at once', async () => {
      form$.update(allValues(200))
      await nextTick()
    }).run()
  })

  test('load data into 200 elements', async ({ bench }) => {
    await bench('load data into 200 elements', async () => {
      await form$.load(allValues(200))
      await nextTick()
    }).run()
  })

  const { el_0 } = createForm({ schema: flatText(200) })

  test('update a single element of 200', async ({ bench }) => {
    await bench('update a single element of 200', async () => {
      el_0.update(`typed ${Date.now()}`)
      await nextTick()
    }).run()
  })
})
