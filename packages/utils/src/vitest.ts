import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

import type { Alias, UserConfig } from 'vite'

import { workspaceSourceAliases } from './sourceAliases'

/**
 * Options for the `vitest` config factory.
 */
export interface VitestOptions {
  /**
   * Additional Vitest config merged (via `mergeConfig`) on top of the generated
   * one — an escape hatch for anything not covered by the defaults.
   */
  vite?: VitestConfig
}

/**
 * Vitest's config shape: vite's `UserConfig` plus the `test` block, typed
 * loosely so this package needs no vitest dependency.
 */
export type VitestConfig = UserConfig & { test?: Record<string, any> }

/**
 * Vitest config factory for the workspace packages — usable directly as the
 * default export of a `vitest.config.ts`:
 *
 * ```ts
 * import { createVitestConfig } from '@vueform/utils'
 *
 * export default createVitestConfig()
 * ```
 *
 * Provides the shared testing setup with no per-package config: the Vue plugin,
 * happy-dom with vitest globals, the `integration` test project, and source
 * aliases for every workspace package (short `#<dir>` aliases with
 * exports-derived subpaths, plus full package names) so tests always run
 * against sources, never dist.
 *
 * A separate `bench` project picks up `tests/bench/**\/*.bench.ts` for `vitest
 * bench` — plain `vitest` never runs bench files and `vitest bench` never runs
 * tests, each mode matching exactly one project.
 *
 * When the package has a `tests/dts` directory, a `test-dts` project is added
 * that typechecks `tests/dts/**\/*.test-d.ts` with `vue-tsc` (run it alone with
 * `vitest run --project test-dts`). The directory needs its own `tsconfig.json`
 * covering the test files (the checker resolves imports through tsconfig paths,
 * not vite aliases), because the package tsconfig excludes `tests/dts` — type
 * tests are the `test-dts` gate's concern, not `check`'s.
 *
 * Dist-type verification lives in the `:release:verify` gate (packed
 * tarballs: publint + attw + the smoke cells' consumer typechecks), not in a
 * vitest project.
 */
export async function createVitestConfig(
  options: VitestOptions = {}
): Promise<VitestConfig> {
  const { mergeConfig } = await import('vite')
  const { default: Vue } = await import('@vitejs/plugin-vue')

  const root = process.cwd()
  const packagesDir = resolve(root, '..')

  const aliases: Alias[] = [
    { find: /^vue$/, replacement: 'vue/dist/vue.esm-bundler.js' },
  ]

  aliases.push(...workspaceSourceAliases(packagesDir))

  const config: VitestConfig = {
    plugins: [Vue()],
    resolve: {
      alias: aliases,
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      projects: [
        {
          extends: true,
          test: {
            name: 'integration',
            include: ['./tests/integration/**/*.test.ts'],
            // Vitest 5: `vitest bench` selects files by `benchmark.include`
            // within the same project (`vitest bench --project integration`),
            // while normal runs use `include` — one project, mode-based
            // selection. A dedicated empty-`include` bench project is pruned
            // by v5 before `--project` filtering and cannot be selected.
            benchmark: { include: ['./tests/bench/**/*.bench.ts'] },
          },
        },

        ...(existsSync(join(root, 'tests/dts'))
          ? [
              {
                extends: true,
                test: {
                  name: 'test-dts',
                  // Runtime runners in the type-test dir (e.g. the SFC
                  // template-type runner, which maps vue-tsc diagnostics to
                  // named tests) run alongside the typecheck pass.
                  include: ['./tests/dts/**/*.test.ts'],
                  benchmark: { include: [] },
                  typecheck: {
                    enabled: true,
                    checker: 'vue-tsc',
                    include: ['./tests/dts/**/*.test-d.ts'],
                    tsconfig: './tests/dts/tsconfig.json',
                  },
                },
              },
            ]
          : []),
      ],
    },
  }

  return options.vite
    ? (mergeConfig(config, options.vite) as VitestConfig)
    : config
}
