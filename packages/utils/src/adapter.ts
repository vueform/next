import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { basename, join, resolve } from 'node:path'
import Dts from 'vite-plugin-dts'
import {
  componentNames,
  createLibBuild,
  escapeRegExp,
  mirrorEntries,
  pruneModules,
  scssExternals,
  shorthandProps,
  shorthandsMarker,
  themeCss,
  themeScss,
  vaporExternals,
} from './shared'
import type { Plugin, UserConfig } from 'vite'

/**
 * Options for the `adapter` config factory.
 */
export interface AdapterOptions {
  /**
   * The package's published name (e.g. `'@vueform/ui'`) — used as the lib name,
   * added to externals, and source-relative self references in emitted `.d.ts`
   * are rewritten to it.
   */
  name: string
  /**
   * Alias pointing at the source directory (e.g. `'@'`). No alias is registered
   * when omitted.
   */
  alias?: string
  /**
   * Additional external module ids. `'vue'`, `name` and `@vueform/core` (all
   * subpaths) are always external.
   */
  external?: (string | RegExp)[]
  /**
   * Also emit minified IIFE bundles for `<script>`/CDN use, one per theme
   * (every `src/themes/<name>.ts` with a matching `src/<name>.ts` entry):
   * `dist/<name>.global.js` with its stylesheet beside it as `dist/<name>.css`,
   * everything bundled except `vue` (global `Vue`).
   */
  cdn?: boolean
  /**
   * Also emit the vapor-mode build after the main bundle: the `src/components`
   * tree into `dist/vapor/components` plus a `dist/vapor/<theme>.mjs` entry per
   * theme, with every SFC compiled by Vue 3.6's vapor compiler. Shared logic is
   * not duplicated — vapor modules import it from the main dist via relative
   * paths, and `@vueform/core` component subpaths are rewritten to their
   * `/vapor` equivalents so the two mode trees never mix. Types are not
   * re-emitted; vapor exports reuse the `.d.ts` files from the main dist.
   */
  vapor?: boolean
  /**
   * Additional Vite config merged (via `mergeConfig`) on top of the generated
   * one — an escape hatch for anything not covered by the options.
   */
  vite?: UserConfig
}

/**
 * Theme names: every raw token map in `src/themes` that has a matching
 * top-level entry (`src/<name>.ts`) — e.g. `origin`, `material`.
 */
function themeNames(srcAbs: string): string[] {
  const themesAbs = resolve(srcAbs, 'themes')
  if (!existsSync(themesAbs)) return []
  return readdirSync(themesAbs)
    .filter((file) => file.endsWith('.ts') && !file.endsWith('.d.ts'))
    .map((file) => basename(file, '.ts'))
    .filter(
      (name) => name !== 'index' && existsSync(resolve(srcAbs, `${name}.ts`))
    )
}

function adapterExternal(options: AdapterOptions): (string | RegExp)[] {
  return ['vue', options.name, /^@vueform\/core/, ...(options.external ?? [])]
}

/**
 * Root-level vapor build entries derived from the package's exports map: every
 * `vapor` condition of the form `./dist/vapor/<name>.mjs` whose `src/<name>.ts`
 * exists.
 */
function exportedVaporEntries(root: string, srcAbs: string): string[] {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  const names = new Set<string>()

  for (const value of Object.values(pkg.exports ?? {})) {
    const vapor = (value as Record<string, unknown> | null)?.vapor
    if (typeof vapor !== 'string') continue
    const match = vapor.match(/^\.\/dist\/vapor\/([\w-]+)\.mjs$/)
    if (match && existsSync(resolve(srcAbs, `${match[1]}.ts`))) {
      names.add(match[1])
    }
  }

  return [...names]
}

/**
 * Runs the vapor-mode build after the main bundle is written: the
 * `src/components` tree plus the theme entries emitted into `dist/vapor`,
 * compiled by Vue 3.6's vapor compiler (provided via the
 * `vue-compiler-sfc-vapor` npm alias, a devDependency of the consuming
 * package). Everything outside the vapor entry set resolves to the main dist
 * (see `vaporExternals`), and external `@vueform/core` component subpaths are
 * rewritten to their `/vapor` equivalents so the vapor module tree never mixes
 * with the VDOM one (mixing would duplicate shared module state).
 */
function vaporBuild(
  options: AdapterOptions,
  root: string,
  srcAbs: string
): Plugin {
  return {
    name: 'vf:vapor-build',
    async closeBundle() {
      const { build } = await import('vite')
      const { default: Vue } = await import('@vitejs/plugin-vue')

      const consumerRequire = createRequire(join(root, 'package.json'))
      const VaporCompiler = consumerRequire('vue-compiler-sfc-vapor')
      // The `vue/compiler-sfc` wrapper normally registers TypeScript so
      // imported types (defineProps<...>) can be resolved via ts.sys. Using
      // the raw aliased @vue/compiler-sfc package, we register it ourselves.
      VaporCompiler.registerTS(() => consumerRequire('typescript'))

      const componentsAbs = resolve(srcAbs, 'components')
      const outDir = 'dist/vapor'

      const entries: Record<string, string> = {}
      for (const [name, file] of Object.entries(mirrorEntries(componentsAbs))) {
        entries[`components/${name}`] = file
      }
      for (const theme of themeNames(srcAbs)) {
        entries[theme] = resolve(srcAbs, `${theme}.ts`)
      }
      // Every root-level vapor file the exports map promises must actually be
      // emitted. Themes double as entries in some adapters (ui's origin /
      // material), but not all: primevue's batteries entry is `full` with a
      // separate `theme`, and themeNames alone would skip it, publishing an
      // exports condition that points at a missing file.
      for (const name of exportedVaporEntries(root, srcAbs)) {
        entries[name] = resolve(srcAbs, `${name}.ts`)
      }

      const buildOptions = createLibBuild({
        name: options.name,
        entries,
        preserveRoot: srcAbs,
        outDir,
        external: adapterExternal(options),
        cssExternalSideEffects: true,
        noHoistTransitiveImports: true,
      })
      // The externals plugin rewrites the absolute main-dist ids itself.
      buildOptions.rollupOptions!.makeAbsoluteExternalsRelative = false
      // Point external core component imports at core's vapor tree.
      ;(buildOptions.rollupOptions!.output as Record<string, unknown>).paths = (
        id: string
      ) =>
        id.startsWith('@vueform/core/components/')
          ? id.replace(
              '@vueform/core/components/',
              '@vueform/core/vapor/components/'
            )
          : id

      await build({
        // Never load the consumer's vite.config.ts — that is the config that
        // spawned this build.
        configFile: false,
        root,
        define: {
          // Selects the vapor function form of shared dual-mode directives.
          __VUEFORM_VAPOR__: JSON.stringify(true),
        },
        resolve: {
          alias: options.alias ? { [options.alias]: srcAbs } : {},
        },
        plugins: [
          shorthandsMarker(),
          pruneModules(),
          scssExternals(options.name, resolve(srcAbs, 'scss')),
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
 * Runs the CDN builds after the main bundle is written: one minified IIFE
 * bundle per theme (`dist/<theme>.global.js` + `dist/<theme>.css`), with
 * everything bundled — components, theme, styles — except `vue`, consumed as
 * the global `Vue`.
 */
function cdnBuild(
  options: AdapterOptions,
  root: string,
  srcAbs: string
): Plugin {
  return {
    name: 'vf:cdn-build',
    async closeBundle() {
      const { build } = await import('vite')
      const { default: Vue } = await import('@vitejs/plugin-vue')

      // Theme-entry packages (ui) get one bundle per theme; single-entry
      // packages (primevue) bundle `src/full.ts` as `vueform.global.js`.
      const themes = themeNames(srcAbs)
      const bundles = themes.length
        ? themes.map((theme) => ({
            label: theme,
            entry: resolve(srcAbs, `${theme}.ts`),
          }))
        : existsSync(resolve(srcAbs, 'full.ts'))
          ? [{ label: 'vueform', entry: resolve(srcAbs, 'full.ts') }]
          : []

      for (const { label, entry } of bundles) {
        await build({
          configFile: false,
          root,
          define: {
            __VUEFORM_VAPOR__: JSON.stringify(false),
          },
          resolve: {
            alias: options.alias ? { [options.alias]: srcAbs } : {},
          },
          plugins: [
            shorthandsMarker(),
            Vue({
              template: {
                compilerOptions: {
                  comments: false,
                },
              },
            }),
          ],
          logLevel: 'warn',
          build: {
            minify: 'terser',
            lib: {
              formats: ['iife'],
              name: 'Vueform',
              entry,
              fileName: () => `${label}.global.js`,
            },
            outDir: 'dist',
            emptyOutDir: false,
            cssCodeSplit: false,
            rollupOptions: {
              external: ['vue'],
              // The package's `sideEffects` field only lists styles, and
              // vite's resolver applies it per module — overriding any
              // `treeshake.moduleSideEffects` setting — which severs the tier
              // modules' side-effect `import './styles'` chains and drops the
              // stylesheet. A CDN bundle ships everything registered anyway,
              // so skip treeshaking outright.
              treeshake: false,
              output: {
                globals: { vue: 'Vue' },
                inlineDynamicImports: true,
                assetFileNames: `${label}.[ext]`,
              },
            },
          },
        })
      }
    },
  }
}

/**
 * Vite config factory for adapter packages (ui, primevue, …) — usable directly
 * as the default export of a `vite.config.ts`:
 *
 * ```ts
 * import { createAdapterConfig } from '@vueform/utils'
 *
 * export default createAdapterConfig({ name: '@vueform/ui' })
 * ```
 *
 * The build mirrors `src` 1:1 into `dist` (what is public API is decided solely
 * by the package's `exports` map), ships the theme scss forwarders compiled
 * into css chunks plus the flattened `theme.css`, and keeps everything an
 * adapter builds on — vue, core, its own runtime dependencies — external.
 */
export async function createAdapterConfig(
  options: AdapterOptions
): Promise<UserConfig> {
  // Dynamic imports: vite's Node API and @vitejs/plugin-vue ship ESM only,
  // while this package compiles to CJS — a static import would not resolve.
  const { default: Vue } = await import('@vitejs/plugin-vue')
  const { mergeConfig } = await import('vite')

  const root = process.cwd()
  const srcAbs = resolve(root, 'src')
  const scssAbs = resolve(srcAbs, 'scss')

  const config: UserConfig = {
    root,
    define: {
      // Selects the vdom function form of shared dual-mode directives.
      __VUEFORM_VAPOR__: JSON.stringify(false),
    },
    resolve: {
      alias: options.alias ? { [options.alias]: srcAbs } : {},
    },
    plugins: [
      shorthandsMarker(),
      pruneModules(),
      scssExternals(options.name, scssAbs),
      // Ship the scss forwarders (`<name>/*.scss`) and compile them into the
      // `<name>/*.css` chunks …
      themeScss(
        root,
        scssAbs,
        resolve(root, 'dist/scss'),
        resolve(root, 'dist/css'),
        { '@vueform/core': '../core/src/scss' }
      ),
      // … and flatten the chunks into dist/css/theme.css for <link>/CDN use.
      themeCss(
        root,
        resolve(scssAbs, 'theme.scss'),
        resolve(root, 'dist/css'),
        resolve(root, 'dist/css/theme.css'),
        resolve(root, 'dist/scss/theme.scss')
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
        include: ['src'],
        compilerOptions: {
          // Replace the root tsconfig's source `paths` with the adapter's own
          // alias: `@vueform/core` then resolves to its built dist types via
          // node_modules, so the adapter is checked against the same types
          // consumers get and the emitted d.ts references bare package
          // specifiers. Requires core to be built first.
          paths: options.alias
            ? {
                [options.alias]: [join(srcAbs, 'index.ts')],
                [`${options.alias}/*`]: [`${srcAbs}/*`],
              }
            : {},
        },
        beforeWriteFile(filePath, content) {
          const rewritten = content
            // TS declaration emit names inferred types via the nearest
            // in-program re-exporter — this package's own src/index.ts —
            // as a source-relative `.ts` specifier. src is not shipped, so
            // rewrite those references to the public entry.
            .replace(/['"][^'"]*?src\/index\.ts['"]/g, `'${options.name}'`)
            // The styles sidecars' side-effect imports keep their source
            // spelling; rewrite to the published subpaths so the shipped
            // d.ts mirrors the runtime modules.
            .replace(
              options.alias
                ? new RegExp(
                    `(["'])${escapeRegExp(options.alias)}/scss/([\\w-]+)\\.scss(["'])`,
                    'g'
                  )
                : /$^/,
              `$1${options.name}/$2.css$3`
            )

          // Any surviving relative `.ts` augmentation target would silently
          // dead-letter its registrations for consumers (the specifier
          // resolves to nothing in dist) — fail the build instead.
          const stray = rewritten.match(/declare module ['"][^'"]*\.ts['"]/)
          if (stray) {
            throw new Error(
              `[vf:adapter] Unrewritten module augmentation ${stray[0]} in ${filePath}`
            )
          }

          return { filePath, content: rewritten }
        },
      }),
      ...(options.vapor ? [vaporBuild(options, root, srcAbs)] : []),
      ...(options.cdn ? [cdnBuild(options, root, srcAbs)] : []),
      shorthandProps(resolve(root, 'dist'), '@vueform/core'),
      componentNames(resolve(root, 'dist/components')),
    ],
    logLevel: 'warn',
    build: createLibBuild({
      name: options.name,
      entries: mirrorEntries(srcAbs),
      preserveRoot: srcAbs,
      outDir: 'dist',
      external: adapterExternal(options),
      cssExternalSideEffects: true,
      noHoistTransitiveImports: true,
    }),
  }

  return options.vite ? mergeConfig(config, options.vite) : config
}
