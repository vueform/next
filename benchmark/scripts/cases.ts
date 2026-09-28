/**
 * The case registry: what the suite measures and how each case is sampled.
 *
 * `id` doubles as the case's key in `results/json/benchmarks.json` and the base
 * of its chart filenames (`<id>-time.svg`, `<id>-memory.svg`), which the docs'
 * performance guide references — renaming a case is a docs change too.
 */

export type Mode = 'vdom' | 'vapor'

export const MODES: Mode[] = ['vdom', 'vapor']

/**
 * Element counts each case sweeps by default.
 */
export const SWEEP = [100, 250, 500, 750, 1000]

export interface BenchCase {
  id: string
  /**
   * Chart title base and the JSON `label`.
   */
  label: string
  description: string
  /**
   * Record forced-GC heap deltas (rendering cases only).
   */
  memory: boolean
  /**
   * Repetitions per sweep point, each in a fresh page.
   */
  reps: number
  /**
   * In-page untimed iterations before measurement (iterate cases).
   */
  warmup?: number
  /**
   * In-page timed iterations (iterate cases).
   */
  iterations?: number
}

export const CASES: BenchCase[] = [
  {
    id: 'render-text',
    label: 'Render N Text Elements',
    description:
      'Mounts a form whose schema holds N text elements, from schema to painted DOM.',
    memory: true,
    reps: 5,
  },
  {
    id: 'render-steps',
    label: 'Render N Text Elements Across 10 Steps',
    description:
      'Mounts the same N text elements split evenly across 10 steps of a stepped form.',
    memory: true,
    reps: 5,
  },
  {
    id: 'input-text',
    label: 'Input into One of N Text Elements',
    description:
      'Dispatches native input events into one element of a mounted N-element form.',
    memory: false,
    reps: 3,
    warmup: 10,
    iterations: 50,
  },
  {
    id: 'input-text-vmodel',
    label: 'Input into One of N Text Elements (v-model)',
    description:
      'The input case with an active v-model binding on the form, so every keystroke syncs the full model.',
    memory: false,
    reps: 3,
    warmup: 10,
    iterations: 50,
  },
  {
    id: 'update-all',
    label: 'Update Full Data of N Elements',
    description:
      "Replaces every element's value at once via form$.update() on a mounted N-element form.",
    memory: false,
    reps: 3,
    warmup: 5,
    iterations: 25,
  },
]
