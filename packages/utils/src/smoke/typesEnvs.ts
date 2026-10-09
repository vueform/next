/**
 * The smoke-types env model.
 *
 * A types env is one consumer TYPECHECK setup, run against the same packed
 * tarballs and committed fixtures as the smoke suite — but where the smoke
 * matrix varies the runtime (framework × rendering × mode), the types matrix
 * varies what actually changes the types a consumer sees: the tsconfig
 * (moduleResolution, skipLibCheck), the TypeScript version, and the checker
 * (vue-tsc over the fixture app, plain tsc over a generated resolution
 * probe, or nuxi typecheck for the generated Nuxt types). Runtime dimensions
 * are deliberately absent: spa/ssr and vdom/vapor resolve the same d.ts.
 */
import type { Framework } from './envs'

/**
 * The oldest TypeScript release the shipped d.ts must work with — the public
 * support floor, proven by the `-nodenext` env. Bump deliberately.
 */
export const MIN_TYPESCRIPT = '5.8.3'

/**
 * What the vue-tsc envs check with when an env pins nothing: the newest
 * STABLE tsc line vue-tsc can drive. Not `latest` — that is TypeScript 7
 * (the Go port), which vue-tsc cannot load (no `./lib/tsc` export); bump
 * this (or switch back to `latest`) once vue-tsc supports it.
 */
export const DEFAULT_TYPESCRIPT = '^5.9.0'

/**
 * How an env checks types:
 *
 * - `vue-tsc`: the fixture app + injected smoke content (incl. the adapter's
 *   `tests/smoke/shared/type-tests/`) through `vue-tsc --noEmit`, with the
 *   env's compilerOptions overlaid on the fixture's own tsconfig.
 * - `tsc-probe`: a generated probe importing the package surface, through
 *   plain `tsc` under nodenext resolution — what a raw tsc/ts-node consumer
 *   resolves, with every reachable d.ts libchecked.
 * - `nuxi`: `nuxi typecheck` — the generated `.nuxt` tsconfig, the module's
 *   type template and auto-registered component augmentations.
 */
export type TypesCheck = 'vue-tsc' | 'tsc-probe' | 'nuxi'

export interface TypeEnvDef {
  /**
   * Env id, also the run directory suffix (`<adapter>-<id>` under
   * `.vueform/smoke-types/runs/`).
   */
  id: string
  framework: Framework
  /**
   * Fixture shell under `smoke-test/envs/` (in @vueform/utils),
   * shared with the smoke envs.
   */
  fixture: string
  check: TypesCheck
  /**
   * compilerOptions overlaid onto the fixture's tsconfig (`vue-tsc`) or the
   * generated probe config (`tsc-probe`).
   */
  compilerOptions?: Record<string, unknown>
  /**
   * The `typescript` devDependency installed into the run. Defaults to
   * `DEFAULT_TYPESCRIPT`.
   */
  typescript?: string
  note: string
}

export const TYPE_ENVS: TypeEnvDef[] = [
  {
    id: 'vite',
    framework: 'vite',
    fixture: 'vite',
    check: 'vue-tsc',
    note: 'fresh Vite scaffold defaults (bundler resolution, skipLibCheck)',
  },
  {
    id: 'vite-strict',
    framework: 'vite',
    fixture: 'vite',
    check: 'vue-tsc',
    compilerOptions: { skipLibCheck: false },
    note: 'skipLibCheck: false — every shipped d.ts joins the program',
  },
  {
    id: 'vite-nodenext',
    framework: 'vite',
    fixture: 'vite',
    check: 'tsc-probe',
    typescript: MIN_TYPESCRIPT,
    note: `nodenext resolution probe on the TS support floor (${MIN_TYPESCRIPT})`,
  },
  {
    id: 'nuxt',
    framework: 'nuxt',
    fixture: 'nuxt',
    check: 'nuxi',
    note: 'nuxi typecheck — generated .nuxt types + module augmentations',
  },
]
