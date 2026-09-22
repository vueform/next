/**
 * Mounted-form benches for the registration pipeline (`children$` +
 * `elements$`).
 *
 * - mount+unmount — full register/unregister of N grouped fields
 * - payload reads — cached aggregate path (payload/invalid/empty/…)
 * - condition toggle — hide/show ~1/3 of fields, then re-read aggregates
 * - list add/remove — one row on an 80-row list (path re-key identity guard)
 */
import { afterAll, bench, describe } from 'vitest'
import { nextTick } from 'vue'
import { createPerfForm, listSchema, readAggregates } from '../helpers'

describe('form-registry', () => {
  const form100 = createPerfForm(100)
  const form300 = createPerfForm(300)
  const listForm = createPerfForm(listSchema(80))

  afterAll(() => {
    form100.form.unmount()
    form300.form.unmount()
    listForm.form.unmount()
  })

  bench(
    'mount+unmount n=100',
    () => {
      const { form } = createPerfForm(100)
      form.unmount()
    },
    { warmupIterations: 2, iterations: 10 }
  )

  bench(
    'mount+unmount n=300',
    () => {
      const { form } = createPerfForm(300)
      form.unmount()
    },
    { warmupIterations: 2, iterations: 10 }
  )

  // Cached-path guard: payload/invalid/etc. are computeds, so this does not
  // exercise toRef rebuild-on-read (see registry.bench.ts for that). It
  // catches regressions in the already-cached aggregate read.
  bench('payload reads n=300', () => {
    readAggregates(form300.form$)
  })

  bench('condition toggle + payload n=300', () => {
    const trigger = form300.trigger
    trigger.update(trigger.model === 'yes' ? 'no' : 'yes')
    readAggregates(form300.form$)
  })

  bench(
    'list row add/remove',
    async () => {
      await listForm.list.add()
      listForm.list.remove()
      await nextTick()
    },
    { warmupIterations: 5, iterations: 25 }
  )
})
