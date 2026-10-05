/**
 * The smoke-test cell model.
 *
 * A cell is one project setup an adapter is smoke-tested in, described by three
 * dimensions: env (vite | nuxt | nuxt3), rendering (spa | ssr) and mode
 * (vdom | vapor). CLI flags are FILTERS over the fixed cell set — each given
 * dimension flag narrows the selection to cells matching any of that
 * dimension's given values, and a selection that comes up empty is an
 * unsupported combination (e.g. `--nuxt --vapor`).
 */

export const ENVS = ['vite', 'nuxt', 'nuxt3'] as const
export const RENDERINGS = ['spa', 'ssr'] as const
export const MODES = ['vdom', 'vapor'] as const
export const PMS = ['pnpm', 'npm', 'yarn', 'bun'] as const

export type Env = (typeof ENVS)[number]
export type Rendering = (typeof RENDERINGS)[number]
export type SfcMode = (typeof MODES)[number]
export type Pm = (typeof PMS)[number]

export interface CellDef {
  /**
   * Cell id, also the run directory suffix.
   */
  id: string
  env: Env
  rendering: Rendering
  mode: SfcMode
  /**
   * Fixture directory under `packages/<adapter>/tests/smoke/`. Variants
   * (nuxt-spa) share the fixture of their base cell.
   */
  fixture: string
  /**
   * Extra env vars the fixture's scripts receive (variant flips).
   */
  fixtureEnv?: Record<string, string>
  note: string
}

export const CELLS: CellDef[] = [
  {
    id: 'vite',
    env: 'vite',
    rendering: 'spa',
    mode: 'vdom',
    fixture: 'vite',
    note: 'plain Vite SPA, vite build + preview',
  },
  {
    id: 'vite-ssr',
    env: 'vite',
    rendering: 'ssr',
    mode: 'vdom',
    fixture: 'vite-ssr',
    note: 'minimal Vite SSR (no Nuxt)',
  },
  {
    id: 'vapor',
    env: 'vite',
    rendering: 'spa',
    mode: 'vapor',
    fixture: 'vapor',
    note: 'Vue Vapor SFC compilation (vue 3.6)',
  },
  {
    id: 'nuxt',
    env: 'nuxt',
    rendering: 'ssr',
    mode: 'vdom',
    fixture: 'nuxt',
    note: '@vueform/nuxt module on Nuxt 4, nuxi build + preview (SSR)',
  },
  {
    id: 'nuxt-spa',
    env: 'nuxt',
    rendering: 'spa',
    mode: 'vdom',
    fixture: 'nuxt',
    fixtureEnv: { SMOKE_NUXT_SSR: 'false' },
    note: 'same nuxt fixture with ssr: false',
  },
  {
    id: 'nuxt3',
    env: 'nuxt3',
    rendering: 'ssr',
    mode: 'vdom',
    fixture: 'nuxt3',
    note: '@vueform/nuxt module on Nuxt 3, nuxi build + preview (SSR)',
  },
  {
    id: 'nuxt3-spa',
    env: 'nuxt3',
    rendering: 'spa',
    mode: 'vdom',
    fixture: 'nuxt3',
    fixtureEnv: { SMOKE_NUXT_SSR: 'false' },
    note: 'same nuxt3 fixture with ssr: false',
  },
]

export interface CellFilters {
  envs: Env[]
  renderings: Rendering[]
  modes: SfcMode[]
}

/**
 * Whether the env is a Nuxt-family one (any major). Nuxt-family cells share
 * the `.nuxt.<ext>` template variants and the module-driven wiring (no manual
 * components import — the @vueform/nuxt type template must do it).
 */
export function isNuxtEnv(env: Env): boolean {
  return env !== 'vite'
}

/**
 * Applies the dimension filters. An empty filter array means "no filter on this
 * dimension".
 */
export function filterCells(filters: CellFilters): CellDef[] {
  return CELLS.filter(
    (cell) =>
      (!filters.envs.length || filters.envs.includes(cell.env)) &&
      (!filters.renderings.length ||
        filters.renderings.includes(cell.rendering)) &&
      (!filters.modes.length || filters.modes.includes(cell.mode))
  )
}
