import { nextTick } from 'vue'

import { defineCase, type SetupResult } from '../case'
import { settle } from '../helpers'
import { textSchema } from '../schemas'

/**
 * Full-form updates per timed run. Batching amortizes the two-rAF settle floor
 * so the per-update cost dominates the measurement.
 */
const BATCH = 10

let counter = 0

export default defineCase({
  id: 'update-all',
  label: 'Update Full Data of N Elements',
  description:
    'Mounts a form with N text elements (untimed), then calls ' +
    '`form$.update()` with fresh values for all N fields. Times are the ' +
    `average of one full update (measured in batches of ${BATCH}).`,
  ns: [100, 250, 500, 750, 1000],
  batch: BATCH,
  setup: async ({ mount, n }) => {
    const instance: SetupResult = await mount({ schema: textSchema(n) })
    await settle()

    // Sanity check (untimed): make sure form$.update actually reaches the
    // model, so the timed runs measure real update work.
    instance.form$.update({ t0: 'sanity' })
    await nextTick()

    if (instance.form$.model.t0 !== 'sanity') {
      throw new Error('update-all: form$.update did not update form data (t0)')
    }

    return instance
  },
  run: async ({ instance, n }) => {
    const form$ = instance!.form$

    for (let i = 0; i < BATCH; i++) {
      // Fresh values for every field so no update is skipped as a no-op.
      const data: Record<string, string> = {}
      for (let j = 0; j < n; j++) {
        data[`t${j}`] = `value-${counter}-${j}`
      }
      counter++

      form$.update(data)
      await nextTick()
    }
  },
})
