import { defineCase } from '../case'
import { steppedTextSchema } from '../schemas'

const STEPS = 10

/**
 * Sweep points whose rendered-input count has been verified. The check runs
 * once per sweep point, on the first (warmup, unmeasured) run, so it does not
 * distort the timed runs.
 */
const verified = new Set<number>()

export default defineCase({
  id: 'render-steps',
  label: `Render N Text Elements Across ${STEPS} Steps`,
  description:
    `Mounts a stepped form whose N text elements are split evenly across ` +
    `${STEPS} steps. Elements on inactive steps defer their views to idle ` +
    `time, so the mount itself only renders the active step's N / ${STEPS} ` +
    `inputs; the rest stream into the DOM (hidden) after the form is ` +
    `interactive.`,
  ns: [100, 250, 500, 750, 1000],
  run: async ({ mount, n }) => {
    const instance = await mount({
      schema: steppedTextSchema(n, STEPS),
      stepped: true,
    })

    // Sanity check: the mount is only cheaper if inactive steps defer their
    // views. Count synchronously, before any idle callback can start filling
    // in the deferred views.
    if (!verified.has(n)) {
      const inputs = instance.container.querySelectorAll('input').length
      const expected = n / STEPS

      if (inputs !== expected) {
        throw new Error(
          `render-steps: expected ${expected} rendered inputs (one step), found ${inputs}`
        )
      }

      verified.add(n)
    }

    return instance
  },
})
