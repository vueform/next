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

/**
 * The TypeScript versions the probe envs sweep: the support floor plus the
 * latest of each major. Plain `tsc` probes on purpose — vue-tsc cannot
 * drive TS 7 (see DEFAULT_TYPESCRIPT) and is unproven on the 6 beta, while
 * the probe checks what version compatibility is really about: the shipped
 * d.ts resolving and libchecking clean under each compiler.
 *
 * `6.0.0-beta` is a literal because no stable 6 exists yet (semver ranges
 * skip prereleases) — switch it to '6' when 6.0 ships.
 */
export const PROBE_TYPESCRIPTS: Record<string, string> = {
  'ts-min': MIN_TYPESCRIPT,
  'ts-5': '5',
  // Temporarily deactivated until the 6/7 lines stabilize — reactivate by
  // uncommenting ('6.0.0-beta' becomes '6' once a stable 6 ships).
  // 'ts-6': '6.0.0-beta',
  // 'ts-7': '7',
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
    id: 'nuxt',
    framework: 'nuxt',
    fixture: 'nuxt',
    check: 'nuxi',
    note: 'nuxi typecheck — generated .nuxt types + module augmentations',
  },
  ...Object.entries(PROBE_TYPESCRIPTS).map(([id, typescript]): TypeEnvDef => ({
    id,
    framework: 'vite',
    fixture: 'vite',
    check: 'tsc-probe',
    typescript,
    note:
      id === 'ts-min'
        ? `nodenext resolution probe on the TS support floor (${MIN_TYPESCRIPT})`
        : `nodenext resolution probe on typescript@${typescript}`,
  })),
]
