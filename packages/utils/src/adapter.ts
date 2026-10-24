import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'

import type { Plugin, UserConfig } from 'vite'

import { legalBanner, SRC_ALIAS } from './shared'

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
   * The package directory. Pass `fileURLToPath(new URL('.', import.meta.url))`
   * from the package's `vite.config.ts`: tools that load workspace configs from
   * elsewhere (e.g. `vp run` building its task graph) do not set
   * `process.cwd()` to the package dir, which remains the fallback.
   */
  dir?: string
  /**
   * Additional external module ids. `'vue'`, `name` and `@vueform/core` (all
   * subpaths) are always external.
   */
  external?: (string | RegExp)[]
  /**
   * Also emit minified IIFE bundles for `<script>`/CDN use: the default entry
   * (`src/bundle.ts`) as `dist/vueform.global.js`, plus one per named theme
   * (every `src/themes/<name>.ts` with a matching `src/<name>.ts` entry) as
   * `dist/<name>.global.js` — each with its stylesheet beside it as
   * `dist/<label>.css`, everything bundled except `vue` (global `Vue`).
   */
  cdn?: boolean
  /**
   * Also emit the vapor-mode build after the main bundle: the `src/components`
   * tree into `dist/vapor/components` plus a `dist/vapor/<theme>.js` entry per
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
 * top-level entry (`src/<name>.ts`) — e.g. `primary`, `material`.
 */
export function themeNames(srcAbs: string): string[] {
  const themesAbs = resolve(srcAbs, 'themes')
  if (!existsSync(themesAbs)) return []
  return readdirSync(themesAbs)
    .filter((file) => file.endsWith('.ts') && !file.endsWith('.d.ts'))
    .map((file) => basename(file, '.ts'))
    .filter(
      (name) => name !== 'index' && existsSync(resolve(srcAbs, `${name}.ts`))
    )
}

/**
 * Root-level vapor build entries derived from the package's exports map: every
 * `vapor` condition of the form `./dist/vapor/<name>.js` whose `src/<name>.ts`
 * exists.
 */
export function exportedVaporEntries(root: string, srcAbs: string): string[] {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  const names = new Set<string>()

  for (const value of Object.values(pkg.exports ?? {})) {
    const vapor = (value as Record<string, unknown> | null)?.vapor
    if (typeof vapor !== 'string') continue
    const match = vapor.match(/^\.\/dist\/vapor\/([\w-]+)\.js$/)
    if (match && existsSync(resolve(srcAbs, `${match[1]}.ts`))) {
      names.add(match[1])
    }
  }

  return [...names]
}

/**
 * Runs the CDN builds after the main bundle is written: the default entry as
 * `dist/vueform.global.js` plus one minified IIFE bundle per named theme
 * (`dist/<theme>.global.js`), each with its stylesheet beside it, with
 * everything bundled — components, theme, styles — except `vue`, consumed as
 * the global `Vue`.
 */
export function cdnBuild(
  options: AdapterOptions,
  root: string,
  srcAbs: string
): Plugin {
  return {
    name: 'vf:cdn-build',
    async closeBundle() {
      const { build } = await import('vite')
      const { default: Vue } = await import('@vitejs/plugin-vue')

      // The default entry (`src/bundle.ts`) builds as `vueform.global.js`,
      // plus one bundle per named theme entry (ui's `src/material.ts` →
      // `material.global.js`); primevue only has the default.
      const themes = themeNames(srcAbs)
      const bundles = [
        ...(existsSync(resolve(srcAbs, 'bundle.ts'))
          ? [{ label: 'vueform', entry: resolve(srcAbs, 'bundle.ts') }]
          : []),
        ...themes.map((theme) => ({
          label: theme,
          entry: resolve(srcAbs, `${theme}.ts`),
        })),
      ]

      for (const { label, entry } of bundles) {
        await build({
          configFile: false,
          root,
          define: {
            __VUEFORM_VAPOR__: JSON.stringify(false),
          },
          resolve: {
            alias: { [SRC_ALIAS]: srcAbs },
          },
          plugins: [
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
                // The `/*!` banner survives the terser pass (legal comments),
                // and CDN bundles travel furthest from the package tarball.
                banner: legalBanner(options.name, root),
                // No `inlineDynamicImports`: Rolldown's iife output disables
                // code splitting already and warns that the option is ignored.
                assetFileNames: `${label}.[ext]`,
              },
            },
          },
        })
      }
    },
  }
}
