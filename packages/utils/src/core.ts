import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'
import Dts from 'vite-plugin-dts'
import {
  createLibBuild,
  escapeRegExp,
  mirrorEntries,
  pruneModules,
  shorthandProps,
  shorthandsMarker,
  themeScss,
  vaporExternals,
} from './shared'
import type { Plugin, UserConfig } from 'vite'

/**
 * Options for the `core` config factory.
 */
export interface CoreOptions {
  /**
   * The package's published name (e.g. `'@vueform/core'`) — used as the lib
   * name, added to externals, and self-augmentations in emitted `.d.ts` are
   * rewritten to it.
   */
  name: string
  /**
   * Alias pointing at the source directory (e.g. `'#core'`). No alias is
   * registered when omitted.
   */
  alias?: string
  /**
   * Additional external module ids. `'vue'` and `name` are always external.
   */
  external?: string[]
  /**
   * Also emit the vapor-mode component build into `dist/vapor/components` after
   * the main bundle: the `src/components` tree, with every SFC compiled by Vue
   * 3.6's vapor compiler. Shared logic (blueprints, tokens, contexts, …) is not
   * duplicated — the vapor modules import it from the main dist via relative
   * paths, so stateful modules exist only once regardless of which mode a
   * consumer resolves. Types are not re-emitted either; vapor exports reuse the
   * `.d.ts` files from the main dist.
   */
  vapor?: boolean
  /**
   * Additional Vite config merged (via `mergeConfig`) on top of the generated
   * one — an escape hatch for anything not covered by the path options.
   */
  vite?: UserConfig
}

function coreExternal(options: CoreOptions): (string | RegExp)[] {
  return ['vue', options.name, ...(options.external ?? [])]
}

/**
 * Runs the vapor-mode component build after the main bundle is written: the
 * `src/components` tree emitted into `dist/vapor/components`, with every SFC
 * compiled by Vue 3.6's vapor compiler and everything outside the components
 * tree imported from the main dist (see `vaporExternals`). The workspace runs
 * Vue 3.5, so the 3.6 compiler is provided via the `vue-compiler-sfc-vapor` npm
 * alias (a devDependency of the consuming package). The emitted code only
 * imports from 'vue' (external), so 3.6 is a runtime requirement for consumers,
 * not a build requirement here.
 */
function vaporBuild(
  options: CoreOptions,
  root: string,
  srcAbs: string
): Plugin {
  return {
    name: 'vf:vapor-build',
    async closeBundle() {
      const { build } = await import('vite')
      const { default: Vue } = await import('@vitejs/plugin-vue')

      // The vapor compiler and typescript are the consuming package's
      // dependencies, not ours.
      const consumerRequire = createRequire(join(root, 'package.json'))
      const VaporCompiler = consumerRequire('vue-compiler-sfc-vapor')
      // The `vue/compiler-sfc` wrapper normally registers TypeScript so
      // imported types (defineProps<...>) can be resolved via ts.sys. Using
      // the raw aliased @vue/compiler-sfc package, we register it ourselves.
      VaporCompiler.registerTS(() => consumerRequire('typescript'))

      const componentsAbs = resolve(srcAbs, 'components')
      const outDir = 'dist/vapor/components'

      const buildOptions = createLibBuild({
        name: options.name,
        // Only the components tree — everything else resolves to the main
        // dist.
        entries: mirrorEntries(componentsAbs),
        preserveRoot: componentsAbs,
        outDir,
        external: coreExternal(options),
      })
      // The externals plugin rewrites the absolute main-dist ids itself.
      buildOptions.rollupOptions!.makeAbsoluteExternalsRelative = false

      await build({
        // Never load the consumer's vite.config.ts — that is the config that
        // spawned this build.
        configFile: false,
        root,
        resolve: {
          alias: options.alias ? { [options.alias]: srcAbs } : {},
        },
        plugins: [
          shorthandsMarker(),
          pruneModules(),
          vaporExternals(root, srcAbs, resolve(root, outDir), [componentsAbs]),
          Vue({
            compiler: VaporCompiler,
            features: {
              vapor: true,
            },
            template: {
              compilerOptions: {
                comments: false,
              },
            },
          }),
        ],
        logLevel: 'warn',
        build: buildOptions,
      })
    },
  }
}

/**
 * Vite config factory for the core package — usable directly as the default
 * export of its `vite.config.ts`:
 *
 * ```ts
 * import { createCoreConfig } from '@vueform/utils'
 *
 * export default createCoreConfig({ name: '@vueform/core' })
 * ```
 *
 * The build mirrors `src` 1:1 into `dist`: every source module becomes an entry
 * (so nothing is tree-shaken away and no anonymous chunks exist), with `.mjs`
 * beside its `.d.ts` at the same path. What is public API is decided solely by
 * the package's `exports` map, not by the build.
 */
export async function createCoreConfig(
  options: CoreOptions
): Promise<UserConfig> {
  // Dynamic imports: vite's Node API and @vitejs/plugin-vue ship ESM only,
  // while this package compiles to CJS — a static import would not resolve.
  const { default: Vue } = await import('@vitejs/plugin-vue')
  const { mergeConfig } = await import('vite')

  const root = process.cwd()
  const srcAbs = resolve(root, 'src')
  const srcRel = 'src'
  const outDir = 'dist'

  const config: UserConfig = {
    root,
    resolve: {
      alias: options.alias ? { [options.alias]: srcAbs } : {},
    },
    plugins: [
      shorthandsMarker(),
      pruneModules(),
      themeScss(
        root,
        resolve(srcAbs, 'scss'),
        resolve(root, outDir, 'scss'),
        resolve(root, outDir, 'css')
      ),
      Vue({
        template: {
          compilerOptions: {
            comments: false,
          },
        },
      }),
      Dts({
        entryRoot: srcAbs,
        rollupTypes: false,
        copyDtsFiles: true,
        insertTypesEntry: true,
        clearPureImport: false,
        include: [srcRel],
        beforeWriteFile(filePath, content) {
          const rewritten = content
            // Self-augmentations reference the source index module; point
            // them at the published package instead. The emitted relative
            // specifier's shape depends on how vite-plugin-dts relativizes
            // the tsconfig-paths-resolved target and has changed across
            // config layouts (`../../index.ts`,
            // `../../../packages/core/src/index.ts`, …), so match any
            // relative `.ts` specifier ending in the source index — the only
            // index-module augmentations core's sources contain are
            // self-references.
            .replace(
              new RegExp(
                `declare module ['"][^'"]*?(?:${escapeRegExp(srcRel)}\\/)?index\\.ts['"]`,
                'g'
              ),
              `declare module '${options.name}'`
            )

          // Any surviving relative `.ts` augmentation target would silently
          // dead-letter its registrations for consumers (the specifier
          // resolves to nothing in dist) — fail the build instead.
          const stray = rewritten.match(/declare module ['"][^'"]*\.ts['"]/)
          if (stray) {
            throw new Error(
              `[vf:core] Unrewritten module augmentation ${stray[0]} in ${filePath}`
            )
          }

          return { filePath, content: rewritten }
        },
      }),
      ...(options.vapor ? [vaporBuild(options, root, srcAbs)] : []),
      shorthandProps(resolve(root, outDir), '../../types'),
    ],
    logLevel: 'warn',
    build: createLibBuild({
      name: options.name,
      // Every module mirrors into dist at its own path.
      entries: mirrorEntries(srcAbs),
      preserveRoot: srcAbs,
      outDir,
      external: coreExternal(options),
    }),
  }

  return options.vite ? mergeConfig(config, options.vite) : config
}
