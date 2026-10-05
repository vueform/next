/**
 * tsdown config factories — the Vite+ -era counterparts of the vite lib-mode
 * factories (`plugin.ts`, later `core.ts`/`adapter.ts`). Each package's
 * `tsdown.config.ts` is a one-line factory call, mirroring how the
 * `vite.config.ts` files call the vite factories. tsdown configs are only ever
 * loaded by the tsdown CLI running in the package directory, so paths are
 * cwd-relative.
 */
import { pruneModules, shorthandsMarker } from './shared'
import type { UserConfig } from 'tsdown'

/**
 * Options for the plugin tsdown factory.
 */
export interface PluginTsdownOptions {
  /**
   * The package's published name (e.g. `'@vueform/expr-eval'`) — added to
   * externals.
   */
  name: string
  /**
   * Additional external module ids. `'vue'`, `name` and `@vueform/core` (all
   * subpaths) are always external.
   */
  external?: (string | RegExp)[]
}

/**
 * tsdown config factory for plugin packages (expr-eval, dompurify, …) — usable
 * directly as the default export of a `tsdown.config.ts`:
 *
 * ```ts
 * import { createPluginTsdownConfig } from '@vueform/utils'
 *
 * export default createPluginTsdownConfig({ name: '@vueform/expr-eval' })
 * ```
 *
 * Mirrors `createPluginConfig` (the vite factory): single-entry ES library,
 * `dist/index.mjs` + `index.d.ts`, everything external. The d.ts is checked
 * with the root tsconfig minus its source `paths`, so `@vueform/core` resolves
 * to its BUILT dist types — the same types consumers get (requires core to be
 * built first).
 */
export function createPluginTsdownConfig(
  options: PluginTsdownOptions
): UserConfig {
  return {
    entry: ['src/index.ts'],
    format: ['es'],
    outDir: 'dist',
    // `.mjs` beside plain `.d.ts` — the exports maps point at `.d.ts`.
    outExtensions: () => ({ js: '.mjs', dts: '.d.ts' }),
    platform: 'neutral',
    minify: false,
    // No down-leveling: ship the source's syntax level, like the vite build.
    target: false,
    deps: {
      neverBundle: [
        'vue',
        options.name,
        /^@vueform\/core/,
        ...(options.external ?? []),
      ],
    },
    dts: {
      compilerOptions: {
        // Drop the root tsconfig's source `paths` (see factory docblock).
        paths: {},
      },
    },
    // The marker/prune plugins are not strictly needed for single-entry
    // plugins; they run here to prove the Rollup-hook ports (virtual module
    // resolution, generateBundle chunk pruning) under raw Rolldown before
    // the core/adapter builds (migration stages 4–5) depend on them.
    plugins: [shorthandsMarker(), pruneModules()],
  }
}
