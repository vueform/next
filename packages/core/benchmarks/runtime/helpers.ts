import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { useChildren } from '@vueform/core'
import { defineComponent, reactive } from 'vue'
import { createForm, mountApp } from '../../tests/helpers'

/**
 * Directory for machine-local baseline / current result JSON.
 */
export const resultsDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '.results'
)

/**
 * A fake child context whose `available` / `isStatic` / `hoisted` fields are
 * reactive, so derived-view computeds invalidate when they change.
 */
export type FakeContext = {
  /**
   * Whether the fake element is static (non-data).
   */
  isStatic: boolean

  /**
   * Whether the fake element is currently available.
   */
  available: boolean

  /**
   * Whether the fake element's data is hoisted to its parent.
   */
  hoisted: boolean
}

/**
 * Builds a schema of `n` text fields chunked into groups of 10, plus a
 * `trigger` field, conditional texts, and a handful of static content elements
 * — enough nested paths for the form's `elements$` mirror to differ from direct
 * `children$`.
 *
 * @param n Number of text fields.
 */
export function largeSchema(n: number) {
  const schema: Record<string, any> = {
    trigger: { type: 'text', default: 'yes' },
  }

  const groupSize = 10
  const groupCount = Math.ceil(n / groupSize)
  let i = 0

  for (let g = 0; g < groupCount; g++) {
    const inner: Record<string, any> = {}

    for (let j = 0; j < groupSize && i < n; j++, i++) {
      inner[`t${i}`] = {
        type: 'text',
        label: `Field ${i}`,
        ...(i % 3 === 0 ? { conditions: [['trigger', '==', 'yes']] } : {}),
      }
    }

    schema[`g${g}`] = { type: 'group', schema: inner }
  }

  const staticCount = Math.max(1, Math.floor(n / 20))

  for (let s = 0; s < staticCount; s++) {
    schema[`c${s}`] = { type: 'content', content: `Static ${s}` }
  }

  return schema
}

/**
 * A list of `rows` single-field rows (`wrap: false`).
 *
 * @param rows Initial row count.
 */
export function listSchema(rows: number) {
  return {
    list: {
      type: 'list',
      wrap: false,
      initial: rows,
      schema: {
        text: { type: 'text' },
      },
    },
  }
}

/**
 * Creates a reactive fake child context.
 *
 * @param overrides Field overrides.
 */
export function fakeContext(overrides: Partial<FakeContext> = {}): FakeContext {
  return reactive({
    isStatic: false,
    available: true,
    hoisted: false,
    ...overrides,
  })
}

/**
 * Mounts a dummy component that owns a `useChildren` registry, optionally
 * pre-registering `n` fake contexts. Needed because `useChildren` →
 * `defineEvents` requires setup + the Vueform plugin.
 *
 * @param n Number of fake children to register.
 */
export function createRegistry(n = 0) {
  let children: ReturnType<typeof useChildren> | undefined
  const contexts: FakeContext[] = []

  const Comp = defineComponent({
    setup() {
      children = useChildren()

      for (let i = 0; i < n; i++) {
        const ctx = fakeContext({
          isStatic: i % 10 === 0,
          available: i % 7 !== 0,
          hoisted: i % 15 === 0,
        })
        contexts.push(ctx)
        children.register(`f${i}`, ctx)
      }

      return () => null
    },
  })

  const wrapper = mountApp(Comp)

  if (!children) {
    throw new Error('useChildren was not created')
  }

  return { children, contexts, wrapper }
}

/**
 * Mounts a large form. Passes `$conditions.debounce: 0` so condition benches
 * don't wait on the default debounce.
 *
 * @param n Number of text fields, or a ready schema object.
 */
export function createPerfForm(n: number | Record<string, any>) {
  const schema = typeof n === 'number' ? largeSchema(n) : n

  return createForm(
    { schema },
    {
      $conditions: { debounce: 0 },
    }
  )
}

/**
 * Touches the form-level aggregations that walk `useChildren` derived views.
 *
 * @param form$ The form context.
 */
export function readAggregates(form$: any) {
  return [
    form$.payload,
    form$.invalid,
    form$.empty,
    form$.dirty,
    form$.completed,
    form$.errors,
  ]
}

/**
 * Forces two GC passes around a microtask so retained-heap snapshots settle.
 */
export async function gcSettle() {
  const gc = (globalThis as any).gc as (() => void) | undefined

  if (typeof gc !== 'function') {
    throw new Error(
      'global.gc is not available; run memory benches via `pnpm bench:perf` (exposes GC)'
    )
  }

  await new Promise((r) => setTimeout(r, 0))
  gc()
  await new Promise((r) => setTimeout(r, 0))
  gc()
}

/**
 * Mean of `values` after dropping the min and max when there are enough
 * samples, to reduce GC noise.
 *
 * @param values Sample values.
 */
export function trimmedMean(values: number[]) {
  if (values.length < 4) {
    return values.reduce((a, b) => a + b, 0) / values.length
  }

  const sorted = [...values].sort((a, b) => a - b)
  const inner = sorted.slice(1, -1)

  return inner.reduce((a, b) => a + b, 0) / inner.length
}

/**
 * Handle returned by a retained-heap setup function.
 */
export type RetainHandle = {
  /**
   * Value that must stay reachable until after the second heap snapshot.
   */
  retain: unknown

  /**
   * Releases the retained value (unmount / unregister).
   */
  dispose: () => void
}

/**
 * Measures retained heap: GC, snapshot, run `setup` while keeping `retain`
 * alive, GC, snapshot, then dispose. Returns the trimmed mean of `samples`
 * deltas after `warmup` discarded runs.
 *
 * @param setup Factory that returns the live object and a disposer.
 * @param options Warmup / sample counts.
 */
export async function measureRetained(
  setup: () => RetainHandle | Promise<RetainHandle>,
  options: { warmup?: number; samples?: number } = {}
) {
  const warmup = options.warmup ?? 2
  const samples = options.samples ?? 5
  const deltas: number[] = []

  for (let i = 0; i < warmup + samples; i++) {
    await gcSettle()
    const before = process.memoryUsage().heapUsed
    const handle = await setup()
    await gcSettle()
    const after = process.memoryUsage().heapUsed

    if (handle.retain == null) {
      throw new Error('retain handle was collected before the heap snapshot')
    }

    handle.dispose()

    if (i >= warmup) {
      deltas.push(after - before)
    }
  }

  return trimmedMean(deltas)
}

/**
 * Measures leftover heap after setup + immediate dispose (leak guard).
 *
 * @param setup Factory that returns a disposer.
 * @param options Warmup / sample counts.
 */
export async function measureLeak(
  setup: () => RetainHandle | Promise<RetainHandle>,
  options: { warmup?: number; samples?: number } = {}
) {
  const warmup = options.warmup ?? 2
  const samples = options.samples ?? 5
  const deltas: number[] = []

  for (let i = 0; i < warmup + samples; i++) {
    await gcSettle()
    const before = process.memoryUsage().heapUsed
    const handle = await setup()
    handle.dispose()
    await gcSettle()
    const after = process.memoryUsage().heapUsed

    if (i >= warmup) {
      deltas.push(after - before)
    }
  }

  return trimmedMean(deltas)
}

const memoryCases: { name: string; mean: number }[] = []

/**
 * Records a retained-heap measurement for the compare script.
 *
 * @param name Case name.
 * @param mean Trimmed-mean heap delta in bytes.
 */
export function recordMemory(name: string, mean: number) {
  memoryCases.push({ name, mean })
}

/**
 * Writes collected memory cases to `results/memory.json`.
 */
export function writeMemoryResults() {
  mkdirSync(resultsDir, { recursive: true })
  writeFileSync(
    resolve(resultsDir, 'memory.json'),
    JSON.stringify({ cases: memoryCases }, null, 2)
  )
}
