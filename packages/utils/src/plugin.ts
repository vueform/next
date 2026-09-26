import { resolve } from 'node:path'
import Dts from 'vite-plugin-dts'
import type { UserConfig } from 'vite'

/**
 * Options for the `plugin` config factory.
 */
export interface PluginOptions {
  /**
   * The package's published name (e.g. `'@vueform/expr-eval'`) — used as the
   * lib name and added to externals.
   */
  name: string
  /**
   * Additional external module ids. `'vue'`, `name` and `@vueform/core` (all
   * subpaths) are always external.
   */
  external?: (string | RegExp)[]
}

/**
 * Vite config factory for plugin packages (expr-eval, dompurify, …) — usable
 * directly as the default export of a `vite.config.ts`:
 *
 * ```ts
 * import { createPluginConfig } from '@vueform/utils'
 *
 * export default createPluginConfig({ name: '@vueform/expr-eval' })
 * ```
 *
 * Plugins are single-entry libraries: `src/index.ts` bundles to
 * `dist/index.mjs` with its `.d.ts` beside it, and everything a plugin builds
 * on (vue, core, its own runtime dependencies) stays external.
 */
export function createPluginConfig(options: PluginOptions): UserConfig {
  const root = process.cwd()
  const srcAbs = resolve(root, 'src')

  return {
    root,
    plugins: [
      Dts({
        entryRoot: srcAbs,
        rollupTypes: false,
        insertTypesEntry: true,
        include: ['src'],
        compilerOptions: {
          // Drop the root tsconfig's source `paths`: `@vueform/core` then
          // resolves to its built dist types via node_modules, so the plugin
          // is checked against the same types consumers get and the emitted
          // d.ts references the bare package specifier instead of relative
          // paths escaping into the workspace. Requires core to be built
          // first.
          paths: {},
        },
      }),
    ],
    logLevel: 'warn',
    build: {
      minify: false,
      lib: {
        formats: ['es'],
        name: options.name,
        fileName: (_, name) => `${name}.mjs`,
        entry: {
          index: resolve(srcAbs, 'index.ts'),
        },
      },
      outDir: 'dist',
      rollupOptions: {
        external: [
          'vue',
          options.name,
          /^@vueform\/core/,
          ...(options.external ?? []),
        ],
      },
    },
  }
}
