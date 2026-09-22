import type { App } from 'vue'

// =============== TYPES ================

/**
 * Handle returned by a target's `mount()`.
 */
export interface MountResult {
  /**
   * The DOM element the form is mounted into.
   */
  container: HTMLElement

  /**
   * The Vue app instance (vdom or vapor).
   */
  app: App

  /**
   * The mounted form's exposed context (template ref on VfForm).
   */
  form$: any

  /**
   * Replaces the props bound to VfForm, re-rendering the form.
   */
  setProps: (props: Record<string, any>) => void

  /**
   * The current value of the harness-side `v-model` binding. Only meaningful
   * for mounts created with `{ vmodel: true }`.
   */
  readonly model?: any

  /**
   * Writes the harness-side `v-model` binding, like a parent component
   * assigning to the bound ref. Only meaningful for `{ vmodel: true }` mounts.
   */
  setModel: (value: any) => void

  /**
   * Unmounts the app and removes the container from the DOM.
   */
  unmount: () => void
}

/**
 * Options for a target's `mount()`.
 */
export interface MountOptions {
  /**
   * Binds a real `v-model` on VfForm (a dedicated per-prop binding, the shape a
   * compiled `v-model` produces), seeded from `props.modelValue`. Without it,
   * v-model-style cases would have to write the model back by replacing the
   * whole `v-bind` object — which in vapor mode invalidates every prop
   * dependency of the form and produces pathological, unrepresentative
   * numbers.
   */
  vmodel?: boolean
}

/**
 * Mounts a VfForm with the given props in the active mode (vdom or vapor).
 */
export type Mount = (
  props: Record<string, any>,
  options?: MountOptions
) => Promise<MountResult>

/**
 * A mount handle optionally extended with case-specific data (e.g. a DOM node
 * selected during setup).
 */
export type SetupResult = MountResult & Record<string, any>

/**
 * Context passed to a case's `run` function for a single sweep point.
 */
export interface CaseContext {
  /**
   * Mounts a form in the active mode.
   */
  mount: Mount

  /**
   * The current sweep value (number of elements).
   */
  n: number

  /**
   * The handle returned by `setup()`, when the case defines one. Mounted once
   * per sweep point, outside the timing window, and unmounted after all runs.
   */
  instance?: SetupResult
}

/**
 * A benchmark case definition. The `run` body (typically mounting a form) is
 * inside the timing window; the returned mount handle is unmounted after each
 * run.
 */
export interface BenchCase {
  /**
   * Unique case identifier used in results and filenames.
   */
  id: string

  /**
   * Human-readable case title used in the report.
   */
  label: string

  /**
   * Optional longer description shown in the report.
   */
  description?: string

  /**
   * The sweep values to benchmark (e.g. [10, 100, 1000]).
   */
  ns: number[]

  /**
   * Measured runs per sweep point, or a function of n. Falls back to size-based
   * defaults.
   */
  runs?: number | ((n: number) => number)

  /**
   * Warmup runs per sweep point, or a function of n. Falls back to size-based
   * defaults.
   */
  warmup?: number | ((n: number) => number)

  /**
   * Whether to record heap deltas. Defaults to true.
   */
  memory?: boolean

  /**
   * Number of identical operations the timed body performs per run. Reported
   * stats (time and heap) are divided by it, so results read as per-operation
   * averages. Defaults to 1.
   */
  batch?: number

  /**
   * Optional untimed setup executed once per sweep point, before warmup. Use it
   * to mount the form outside the timing window for update-style cases. The
   * returned handle is passed to `run` as `instance` and unmounted after all
   * runs.
   *
   * @param ctx The mount function and current sweep value.
   */
  setup?: (ctx: CaseContext) => Promise<SetupResult>

  /**
   * Timed body executed once per run. Cases without `setup` mount inside the
   * body and return the handle for per-run cleanup; cases with `setup` mutate
   * `ctx.instance` and return nothing.
   *
   * @param ctx The mount function, current sweep value and setup handle.
   */
  run: (ctx: CaseContext) => Promise<MountResult | void>
}

// ============= DEFINITIONS ============

/**
 * Identity helper providing typing for case definitions.
 *
 * @param benchCase The case definition.
 */
export function defineCase(benchCase: BenchCase): BenchCase {
  return benchCase
}

/**
 * Default number of measured runs for a sweep value.
 *
 * @param n The sweep value.
 */
export function defaultRuns(n: number) {
  return n >= 1000 ? 15 : 30
}

/**
 * Default number of warmup runs for a sweep value.
 *
 * @param n The sweep value.
 */
export function defaultWarmup(n: number) {
  return n >= 1000 ? 2 : 5
}
