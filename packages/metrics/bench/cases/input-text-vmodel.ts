import { nextTick } from 'vue'

import { defineCase, type SetupResult } from '../case'
import { settle } from '../helpers'
import { textSchema } from '../schemas'

/**
 * Updates per timed run. Batching amortizes the two-rAF settle floor so the
 * per-update cost is measurable even when a single update is sub-millisecond.
 */
const BATCH = 250

let counter = 0

export default defineCase({
  id: 'input-text-vmodel',
  label: 'Input into One of N Text Elements (v-model)',
  description:
    'Same as the plain input case, but the form has an active `v-model` ' +
    '(a real per-prop binding, as compiled `v-model` produces): every change ' +
    'snapshots the full model, emits it, and the parent writes it back into ' +
    'the binding. Times are the average of one input event (measured in ' +
    `batches of ${BATCH}).`,
  ns: [100, 250, 500, 750, 1000],
  memory: false,
  batch: BATCH,
  setup: async ({ mount, n }) => {
    const instance: SetupResult = await mount(
      { schema: textSchema(n) },
      { vmodel: true }
    )

    await settle()

    const inputs = instance.container.querySelectorAll('input')
    const middle = Math.floor(inputs.length / 2)
    const input = inputs[middle]

    // Sanity check (untimed): the dispatched input event must reach the form
    // data AND round-trip through the v-model back to the parent binding.
    input.value = 'sanity'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()

    if (instance.form$.model[`t${middle}`] !== 'sanity') {
      throw new Error(
        `input-text-vmodel: dispatched input event did not update form data (t${middle})`
      )
    }

    if (instance.model?.[`t${middle}`] !== 'sanity') {
      throw new Error(
        `input-text-vmodel: change did not round-trip through v-model (t${middle})`
      )
    }

    instance.input = input

    return instance
  },
  run: async ({ instance }) => {
    const input = instance!.input as HTMLInputElement

    for (let i = 0; i < BATCH; i++) {
      // Unique value every iteration so no update is skipped as a no-op.
      input.value = `value-${counter++}`
      input.dispatchEvent(new Event('input', { bubbles: true }))
      await nextTick()
    }
  },
})
