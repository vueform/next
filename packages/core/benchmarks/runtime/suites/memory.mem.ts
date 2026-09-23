/**
 * Retained-heap snapshots (forced GC). Lower is better; after-unmount should
 * stay ~0.
 *
 * - idle n — mounted form, not read: per-element `useChildren` overhead
 * - after hot reads — same, after touching aggregates (cached lists live)
 * - after unmount — leak guard
 */
import { afterAll, describe, it } from 'vitest'
import {
  createPerfForm,
  measureLeak,
  measureRetained,
  readAggregates,
  recordMemory,
  writeMemoryResults,
} from '../helpers'

describe('memory', () => {
  afterAll(() => {
    writeMemoryResults()
  })

  it('retained heap: mounted form, idle n=300', async () => {
    const mean = await measureRetained(() => {
      const mounted = createPerfForm(300)
      return {
        retain: mounted,
        dispose: () => mounted.form.unmount(),
      }
    })

    recordMemory('idle n=300', mean)
  })

  it('retained heap: mounted form, idle n=1000', async () => {
    const mean = await measureRetained(
      () => {
        const mounted = createPerfForm(1000)
        return {
          retain: mounted,
          dispose: () => mounted.form.unmount(),
        }
      },
      { warmup: 1, samples: 3 }
    )

    recordMemory('idle n=1000', mean)
  })

  it('retained heap: mounted form after hot reads n=300', async () => {
    const mean = await measureRetained(() => {
      const mounted = createPerfForm(300)
      readAggregates(mounted.form$)
      return {
        retain: mounted,
        dispose: () => mounted.form.unmount(),
      }
    })

    recordMemory('hot reads n=300', mean)
  })

  it('retained heap: after unmount n=300', async () => {
    const mean = await measureLeak(() => {
      const mounted = createPerfForm(300)
      return {
        retain: mounted,
        dispose: () => mounted.form.unmount(),
      }
    })

    recordMemory('after unmount n=300', mean)
  })
})
