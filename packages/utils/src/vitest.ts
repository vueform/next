import { join, resolve } from 'node:path'
import { workspaceSourceAliases } from './sourceAliases'
import type { Alias, UserConfig } from 'vite'

/**
 * Options for the `vitest` config factory.
 */
export interface VitestOptions {
  /**
   * The package's own source alias (e.g. `'@'`), pointing at its `src`
   * directory. No alias is registered when omitted.
   */
  alias?: string
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

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
 * A separate `bench` project picks up `tests/bench/**\/*.bench.ts` for
 * `vitest bench` — plain `vitest` never runs bench files and `vitest bench`
 * never runs tests, each mode matching exactly one project.
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
    { find: '#shorthands', replacement: join(__dirname, 'mock.js') },
    ...(options.alias
      ? [
          {
            find: new RegExp(`^${escapeRegExp(options.alias)}/(.+)$`),
            replacement: `${join(root, 'src')}/$1`,
          },
        ]
      : []),
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
            benchmark: { include: [] },
          },
        },
        {
          extends: true,
          test: {
            name: 'bench',
            include: [],
            benchmark: { include: ['./tests/bench/**/*.bench.ts'] },
          },
        },
      ],
    },
  }

  return options.vite
    ? (mergeConfig(config, options.vite) as VitestConfig)
    : config
}
