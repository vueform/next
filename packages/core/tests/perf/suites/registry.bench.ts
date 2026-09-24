/**
 * Micro-benches for `useChildren` in isolation (500 fake children, no VfForm).
 *
 * - repeated reads — cached vs rebuild-on-read of the derived child lists
 * - invalidate + read — flip `available`, then read the lists
 * - registration churn — register + unregister 500 paths
 */
import { afterAll, bench, describe } from 'vitest'
import { createRegistry, fakeContext } from '../helpers'

const N = 500
const READS = 50

describe('registry', () => {
  const live = createRegistry(N)
  const empty = createRegistry(0)
  const pending = Array.from({ length: N }, (_, i) => ({
    path: `c${i}`,
    ctx: fakeContext({
      isStatic: i % 10 === 0,
      available: true,
      hoisted: false,
    }),
  }))

  afterAll(() => {
    live.wrapper.unmount()
    empty.wrapper.unmount()
  })

  bench('derived views: repeated reads', () => {
    const { children } = live

    for (let i = 0; i < READS; i++) {
      void children.statefulChildren$.value
      void children.availableStatefulChildren$.value
      void children.hoistedChildren$.value
    }
  })

  bench('derived views: invalidate + read', () => {
    const { children, contexts } = live
    const ctx = contexts[1]
    ctx.available = !ctx.available
    void children.statefulChildren$.value
    void children.availableStatefulChildren$.value
    void children.hoistedChildren$.value
  })

  bench('registration churn', () => {
    const { children } = empty

    for (const { path, ctx } of pending) {
      children.register(path, ctx)
    }

    for (const { path, ctx } of pending) {
      children.unregister(path, ctx)
    }
  })
})
