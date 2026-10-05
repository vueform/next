/**
 * tsdown config factories — the Vite+ -era counterparts of the vite lib-mode
 * factories (`plugin.ts`, later `core.ts`/`adapter.ts`). Each package's
 * `tsdown.config.ts` is a one-line factory call, mirroring how the
 * `vite.config.ts` files call the vite factories. tsdown configs are only ever
 * loaded by the tsdown CLI running in the package directory, so paths are
 * cwd-relative.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, relative, resolve, sep } from 'node:path'
import {
  escapeRegExp,
  mirrorEntries,
  namespaceExports,
  pruneModules,
  shorthandProps,
  shorthandsMarker,
  themeScss,
  vaporExternals,
} from './shared'
import type { UserConfig } from 'tsdown'
import type { Plugin } from 'vite'

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
 * One rewrite applied to every emitted `.d.ts` by {@link dtsRewrites}.
 */
export interface DtsRewrite {
  pattern: RegExp
  replacement: string
}

/**
 * Options for the core tsdown factories.
 */
export interface CoreTsdownOptions {
  /**
   * The package's published name (e.g. `'@vueform/core'`).
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

/**
 * Filesystem pass over the written `.d.ts` files (closeBundle): resolves source
 * aliases (`#core/x` → a file-relative dist specifier — raw vue-tsc emission
 * keeps path-mapped specifiers verbatim, which consumers cannot resolve),
 * applies the given rewrites, and then HARD-FAILS on any surviving relative
 * `.ts` module augmentation or alias specifier — either would silently break
 * for consumers.
 *
 * This replaces vite-plugin-dts' `beforeWriteFile`: the d.ts now come from a
 * plain `vue-tsc` emission step, so the rewrite happens on disk right after the
 * bundle (and before `shorthandProps`, which reads the rewritten files).
 */
export function dtsRewrites(
  outAbs: string,
  rewrites: DtsRewrite[],
  aliases: Record<string, string> = {}
): Plugin {
  return {
    name: 'vf:dts-rewrites',
    closeBundle() {
      const aliasNames = Object.keys(aliases).map(escapeRegExp).join('|')
      const aliasRe = aliasNames
        ? new RegExp(`(['"])(${aliasNames})(\\/[^'"]*)?\\1`, 'g')
        : null

      const walk = (dir: string) => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const abs = join(dir, entry.name)
          if (entry.isDirectory()) {
            walk(abs)
            continue
          }
          if (!entry.name.endsWith('.d.ts')) continue
          const content = readFileSync(abs, 'utf8')
          let rewritten = content
          if (aliasRe) {
            rewritten = rewritten.replace(
              aliasRe,
              (_m, quote: string, name: string, sub: string | undefined) => {
                const target = join(aliases[name], sub ? sub.slice(1) : 'index')
                let rel = relative(join(abs, '..'), target).split(sep).join('/')
                if (!rel.startsWith('.')) rel = `./${rel}`
                return `${quote}${rel}${quote}`
              }
            )
          }
          for (const { pattern, replacement } of rewrites) {
            rewritten = rewritten.replace(pattern, replacement)
          }
          const stray =
            rewritten.match(/declare module ['"][^'"]*\.ts['"]/) ??
            (aliasRe ? rewritten.match(aliasRe) : null)
          if (stray) {
            throw new Error(
              `[vf:dts-rewrites] Unrewritten specifier ${stray[0]} in ${abs}`
            )
          }
          if (rewritten !== content) writeFileSync(abs, rewritten)
        }
      }
      if (existsSync(outAbs)) walk(outAbs)
    },
  }
}

/**
 * The self-augmentation rewrite shared by the core and adapter builds: any
 * relative `.ts` specifier ending in the source index becomes the published
 * package name (see the vite factories for the full history of emitted
 * shapes).
 */
export function selfAugmentationRewrite(name: string): DtsRewrite {
  return {
    pattern: new RegExp(
      `declare module ['"][^'"]*?(?:${escapeRegExp('src')}\\/)?index\\.ts['"]`,
      'g'
    ),
    replacement: `declare module '${name}'`,
  }
}

const coreExternal = (options: CoreTsdownOptions) => [
  'vue',
  options.name,
  ...(options.external ?? []),
]

const MJS_DTS = () => ({ js: '.mjs' as const, dts: '.d.ts' as const })

/**
 * tsdown config factory for the core package's MAIN build — the counterpart of
 * `createCoreConfig` (the vite factory): every source module mirrors into
 * `dist` at its own path (`.mjs` beside its `.d.ts`), scss compiles through the
 * theme pipeline, SFCs are vdom-compiled, and the d.ts self-augmentation
 * rewrites run as a post-write pass. The vapor component tree is a separate
 * config (`createCoreVaporTsdownConfig`) that the build script runs AFTER this
 * one — it resolves against this build's finished dist.
 */
export async function createCoreTsdownConfig(
  options: CoreTsdownOptions
): Promise<UserConfig> {
  // unplugin-vue ships ESM only, while this package compiles to CJS.
  const { default: Vue } = await import('unplugin-vue/rolldown')

  const root = process.cwd()
  const srcAbs = resolve(root, 'src')
  const outDir = 'dist'
  const outAbs = resolve(root, outDir)

  return {
    entry: mirrorEntries(srcAbs),
    unbundle: true,
    format: ['es'],
    outDir,
    outExtensions: MJS_DTS,
    platform: 'neutral',
    minify: false,
    target: false,
    deps: { neverBundle: coreExternal(options) },
    inputOptions: {
      resolve: {
        alias: options.alias ? { [options.alias]: srcAbs } : {},
      },
    },
    // d.ts comes from a separate `vue-tsc -p tsconfig.dts.json` step run
    // BEFORE this build (see the package's build script): per-module tsc
    // emission preserves `export *` barrels verbatim, where the dts
    // bundler's explicit-name expansion silently drops type names (TS2742
    // in the adapters). `clean` is off so this build keeps those d.ts; the
    // script starts with its own `rm -rf dist`.
    dts: false,
    clean: false,
    plugins: [
      shorthandsMarker(),
      pruneModules(),
      namespaceExports(),
      themeScss(
        root,
        resolve(srcAbs, 'scss'),
        resolve(outAbs, 'scss'),
        resolve(outAbs, 'css')
      ),
      Vue({
        isProduction: true,
        template: { compilerOptions: { comments: false } },
      }),
      dtsRewrites(
        outAbs,
        [selfAugmentationRewrite(options.name)],
        options.alias ? { [options.alias]: outAbs } : {}
      ),
      shorthandProps(outAbs, '../../types', resolve(srcAbs, 'components')),
    ],
  }
}

/**
 * tsdown config factory for the core package's VAPOR component build — the
 * counterpart of the vite factory's nested `vf:vapor-build`: the
 * `src/components` tree emitted into `dist/vapor/components`, every SFC
 * compiled by Vue 3.6's vapor compiler (the `vue-compiler-sfc-vapor` npm alias,
 * a devDependency of the consuming package), and everything outside the
 * components tree imported from the MAIN dist via relative paths. Requires the
 * main build's dist to exist — the build script runs it as a second `tsdown -c
 * tsdown.vapor.config.ts` step.
 */
export async function createCoreVaporTsdownConfig(
  options: CoreTsdownOptions
): Promise<UserConfig> {
  const { default: Vue } = await import('unplugin-vue/rolldown')

  const root = process.cwd()
  const srcAbs = resolve(root, 'src')
  const componentsAbs = resolve(srcAbs, 'components')
  const outDir = 'dist/vapor/components'

  const consumerRequire = createRequire(join(root, 'package.json'))
  const VaporCompiler = consumerRequire('vue-compiler-sfc-vapor')
  // The `vue/compiler-sfc` wrapper normally registers TypeScript so imported
  // types (defineProps<...>) resolve via ts.sys. Using the raw aliased
  // @vue/compiler-sfc package, we register it ourselves.
  VaporCompiler.registerTS(() => consumerRequire('typescript'))

  return {
    entry: mirrorEntries(componentsAbs),
    unbundle: true,
    format: ['es'],
    outDir,
    outExtensions: MJS_DTS,
    platform: 'neutral',
    minify: false,
    target: false,
    deps: { neverBundle: coreExternal(options) },
    inputOptions: {
      resolve: {
        alias: options.alias ? { [options.alias]: srcAbs } : {},
      },
    },
    // Types are not re-emitted; vapor exports reuse the main dist's d.ts.
    dts: false,
    plugins: [
      shorthandsMarker(),
      pruneModules(),
      namespaceExports(),
      vaporExternals(root, srcAbs, resolve(root, outDir), [componentsAbs]),
      Vue({
        isProduction: true,
        compiler: VaporCompiler,
        features: { vapor: true },
        template: { compilerOptions: { comments: false } },
      }),
    ],
  }
}
