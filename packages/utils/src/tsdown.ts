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

import type { UserConfig } from 'tsdown'
import type { Plugin } from 'vite'

import { cdnBuild, exportedVaporEntries, themeNames } from './adapter'
import { dtsEsmExtensionFix } from './dts-esm'
import {
  componentNames,
  escapeRegExp,
  indexBanner,
  mirrorEntries,
  namespaceExports,
  pruneModules,
  scssExternals,
  sfcMirrorEntries,
  sfcReexportClosure,
  sourceSideEffects,
  SRC_ALIAS,
  srcAlias,
  themeCss,
  themeScss,
  vaporExternals,
} from './shared'

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
 * `dist/index.js` + `index.d.ts`, everything external. The d.ts is checked
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
    // `.js` beside plain `.d.ts` — the exports maps point at `.d.ts`.
    outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
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
    // `tsconfig.app.json` explicitly: the package's default tsconfig.json is
    // a solution file (files: [] + references) the dts plugin cannot use.
    // Clearing `customConditions` drops the `dev` src resolution
    // (see factory docblock): `@vueform/core` resolves to BUILT dist types.
    dts: {
      tsconfig: 'tsconfig.app.json',
      compilerOptions: {
        customConditions: [],
      },
    },
    outputOptions: {
      banner: indexBanner(options.name, process.cwd()),
    },
    // The marker/prune plugins are not strictly needed for single-entry
    // plugins; they run here to prove the Rollup-hook ports (virtual module
    // resolution, generateBundle chunk pruning) under raw Rolldown before
    // the core/adapter builds (migration stages 4–5) depend on them.
    plugins: [pruneModules()],
  }
}

/**
 * Filesystem pass over the written `.d.ts` files (closeBundle): resolves source
 * aliases (`#src/x` → a file-relative dist specifier — raw vue-tsc emission
 * keeps path-mapped specifiers verbatim, which consumers cannot resolve),
 * applies the given rewrites, and then HARD-FAILS on any surviving relative
 * `.ts` module augmentation or alias specifier — either would silently break
 * for consumers.
 *
 * This replaces vite-plugin-dts' `beforeWriteFile`: the d.ts now come from a
 * plain `vue-tsc` emission step, so the rewrite happens on disk right after the
 * bundle.
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
          // Named rewrites first: patterns like the adapters' alias-form
          // scss-to-css rewrite must see the ORIGINAL `#alias/...` specifier
          // before the generic alias pass relativizes it.
          for (const { pattern, replacement } of rewrites) {
            rewritten = rewritten.replace(pattern, replacement)
          }
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
          // node16/nodenext ESM declaration resolution needs explicit
          // extensions on every relative specifier — see dtsEsm.ts.
          rewritten = dtsEsmExtensionFix(abs, rewritten)
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

const JS_DTS = () => ({ js: '.js' as const, dts: '.d.ts' as const })

/**
 * Options for the adapter tsdown factories.
 */
export interface AdapterTsdownOptions {
  /**
   * The package's published name (e.g. `'@vueform/ui'`).
   */
  name: string
  /**
   * Additional external module ids. `'vue'`, `name` and `@vueform/core` (all
   * subpaths) are always external.
   */
  external?: (string | RegExp)[]
  /**
   * Also emit the minified per-theme CDN bundles after the main build. Runs the
   * existing programmatic VITE build (`cdnBuild`): the CDN artifact bundles
   * scss through vite's sass css pipeline into `<theme>.css`, which tsdown has
   * no equivalent for — an accepted leaf exception to the tsdown migration.
   */
  cdn?: boolean
}

/**
 * tsdown config factory for the core package's MAIN build — the counterpart of
 * `createCoreConfig` (the vite factory): every source module mirrors into
 * `dist` at its own path (`.js` beside its `.d.ts`), scss compiles through the
 * theme pipeline, SFCs are vdom-compiled, and the d.ts self-augmentation
 * rewrites run as a post-write pass. The vapor component tree is a separate
 * config (`createCoreVaporTsdownConfig`) that the build script runs AFTER this
 * one — it resolves against this build's finished dist.
 */
export async function createCoreTsdownConfig(
  options: CoreTsdownOptions
): Promise<UserConfig> {
  // Dynamic import: defer loading unplugin-vue until a config is built.
  const { default: Vue } = await import('unplugin-vue/rolldown')

  const root = process.cwd()
  const srcAbs = resolve(root, 'src')
  const componentsAbs = resolve(srcAbs, 'components')
  const outDir = 'dist'
  const outAbs = resolve(root, outDir)

  return {
    // Out-of-components SFCs (e.g. helpers/VfPassthrough.vue) are explicit
    // entries: they are published at their own vapor-conditioned subpaths and
    // must be emitted whether or not a barrel imports them. Components SFCs
    // already arrive through their per-component entry modules.
    entry: {
      ...mirrorEntries(srcAbs),
      ...sfcMirrorEntries(srcAbs, [componentsAbs]),
    },
    unbundle: true,
    format: ['es'],
    outDir,
    outExtensions: JS_DTS,
    platform: 'neutral',
    minify: false,
    target: false,
    deps: { neverBundle: coreExternal(options) },
    // d.ts comes from a separate `vue-tsc -p tsconfig.build.json` step run
    // BEFORE this build (see the package's build script). Re-verified on
    // tsdown 0.23 / rolldown-plugin-dts 0.28 (2026-10): `dts: { vue: true,
    // tsconfig: 'tsconfig.app.json' }` emits core fine (surface intact,
    // `export *` barrels expanded to explicit lists), but the ADAPTERS'
    // emission fails with TS2742 — the plugin's per-module tsc emit cannot
    // name the blueprints' inferred builder-chain types through the public
    // barrels and reaches for deep `node_modules/.../dist/...` paths, where
    // vue-tsc's whole-program emitter finds the public aliases. vue-tsc
    // stays the producer. `clean` is off so this build keeps those d.ts;
    // the script starts with its own `rm -rf dist`.
    dts: false,
    clean: false,
    outputOptions: {
      banner: indexBanner(options.name, root),
    },
    plugins: [
      pruneModules(),
      namespaceExports(),
      srcAlias(SRC_ALIAS, srcAbs),
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
      dtsRewrites(outAbs, [selfAugmentationRewrite(options.name)], {
        [SRC_ALIAS]: outAbs,
      }),
    ],
  }
}

/**
 * tsdown config factory for the core package's VAPOR component build — the
 * counterpart of the vite factory's nested `vf:vapor-build`: the dual-compiled
 * trees (`src/components` and `src/tools`) plus any stray SFC and every barrel
 * re-exporting one (SFCs are mode-specific wherever they live) emitted into
 * `dist/vapor` at their src-relative paths, every SFC compiled by Vue 3.6's
 * vapor compiler (the `vue-compiler-sfc-vapor` npm alias, a devDependency of
 * the consuming package), and every shared `.ts` module imported from the MAIN
 * dist via relative paths. Requires the main build's dist to exist — the build
 * script runs it as a second `tsdown -c tsdown.vapor.config.ts` step.
 */
export async function createCoreVaporTsdownConfig(
  options: CoreTsdownOptions
): Promise<UserConfig> {
  const { default: Vue } = await import('unplugin-vue/rolldown')

  const root = process.cwd()
  const srcAbs = resolve(root, 'src')
  const componentsAbs = resolve(srcAbs, 'components')
  const toolsAbs = resolve(srcAbs, 'tools')
  const dualTrees = [componentsAbs, toolsAbs].filter(existsSync)
  const outDir = 'dist/vapor'

  const consumerRequire = createRequire(join(root, 'package.json'))
  const VaporCompiler = consumerRequire('vue-compiler-sfc-vapor')
  // The `vue/compiler-sfc` wrapper normally registers TypeScript so imported
  // types (defineProps<...>) resolve via ts.sys. Using the raw aliased
  // @vue/compiler-sfc package, we register it ourselves.
  VaporCompiler.registerTS(() => consumerRequire('typescript'))

  const entries: Record<string, string> = {}
  for (const tree of dualTrees) {
    const prefix = relative(srcAbs, tree)
    for (const [name, file] of Object.entries(mirrorEntries(tree))) {
      entries[`${prefix}/${name}`] = file
    }
  }
  // Any stray SFC outside the dual trees at its src-relative path, plus every
  // barrel that re-exports an SFC or the tools tree (e.g. the root barrel
  // star-re-exporting `./tools`) — those barrels' main-dist copies carry the
  // vdom compile, so the vapor-conditioned `./tools` / `.` exports point at
  // these copies instead.
  Object.assign(entries, sfcMirrorEntries(srcAbs, [componentsAbs]))
  const sfcBarrels = sfcReexportClosure(srcAbs, dualTrees, [toolsAbs])
  for (const file of sfcBarrels) {
    entries[relative(srcAbs, file).replace(/\.ts$/, '')] = file
  }

  return {
    entry: entries,
    unbundle: true,
    format: ['es'],
    outDir,
    outExtensions: JS_DTS,
    platform: 'neutral',
    minify: false,
    target: false,
    deps: { neverBundle: coreExternal(options) },
    // Types are not re-emitted; vapor exports reuse the main dist's d.ts.
    dts: false,
    inputOptions: {
      // The vapor-externals plugin rewrites the absolute main-dist ids
      // itself (relative to each chunk) — rolldown must not pre-relativize
      // them against the package root.
      makeAbsoluteExternalsRelative: false,
    },
    plugins: [
      pruneModules(),
      namespaceExports(),
      srcAlias(SRC_ALIAS, srcAbs),
      vaporExternals(
        root,
        srcAbs,
        resolve(root, outDir),
        dualTrees,
        sfcBarrels
      ),
      Vue({
        isProduction: true,
        compiler: VaporCompiler,
        features: { vapor: true },
        template: { compilerOptions: { comments: false } },
      }),
    ],
  }
}

const adapterTsdownExternal = (options: AdapterTsdownOptions) => [
  'vue',
  options.name,
  /^@vueform\/core/,
  ...(options.external ?? []),
]

/**
 * External css imports (the scss-externals rewrites) are side-effectful and
 * must survive; other externals are droppable when unused; local modules always
 * keep their side effects. Mirrors the vite factories' rules.
 */
const CSS_SIDE_EFFECT_RULES = [
  { test: /\.css$/, sideEffects: true, external: true },
  { sideEffects: false, external: true },
  { sideEffects: true, external: false },
]

const STYLES_SIDECARS = [/src\/components\/[^/]+\/styles\.ts$/]

/**
 * tsdown config factory for an adapter's MAIN build — the counterpart of
 * `createAdapterConfig` (the vite factory): `src` mirrored 1:1 into `dist`,
 * component scss imports externalized to `<name>/<chunk>.css`, the theme
 * scss/css pipeline, vdom-compiled SFCs, d.ts rewrites as a post-write pass,
 * and optionally the CDN builds. The vapor tree is a separate config
 * (`createAdapterVaporTsdownConfig`) run AFTER this one by the build script;
 * d.ts come from a `vue-tsc -p tsconfig.build.json` step run BEFORE (see the core
 * factory for why).
 */
export async function createAdapterTsdownConfig(
  options: AdapterTsdownOptions
): Promise<UserConfig> {
  const { default: Vue } = await import('unplugin-vue/rolldown')

  const root = process.cwd()
  const srcAbs = resolve(root, 'src')
  const scssAbs = resolve(srcAbs, 'scss')
  const outAbs = resolve(root, 'dist')

  const rewrites: DtsRewrite[] = [
    // The styles sidecars' side-effect scss imports carry no type
    // information, and a css import inside a d.ts cannot resolve for
    // consumers (only skipLibCheck hides the error) — STRIP them from the
    // declarations. The runtime chunks keep the real css side-effect imports
    // (scssExternals). Must run BEFORE the generic alias pass, which would
    // otherwise relativize the `#alias/...` spelling.
    {
      pattern: new RegExp(
        `import\\s+(["'])${escapeRegExp(SRC_ALIAS)}/scss/[\\w-]+\\.scss\\1;?\\r?\\n?`,
        'g'
      ),
      replacement: '',
    },
    // TS declaration emit names inferred types via the nearest in-program
    // re-exporter — this package's own src/index.ts — as a source-relative
    // `.ts` specifier. src is not shipped, so rewrite to the public entry.
    {
      pattern: /['"][^'"]*?src\/index\.ts['"]/g,
      replacement: `'${options.name}'`,
    },
  ]

  return {
    entry: mirrorEntries(srcAbs),
    unbundle: true,
    format: ['es'],
    outDir: 'dist',
    outExtensions: JS_DTS,
    platform: 'neutral',
    minify: false,
    target: false,
    clean: false,
    // d.ts from the vue-tsc step, as in the core factory — see its note for
    // the TS2742 detail. Also tested (2026-10): `dts: { build: true }` (tsc
    // whole-program emit, which WOULD fix the TS2742 naming) has no Vue
    // language support — its project loader cannot contain .vue files — so
    // no plugin option combination works for SFC packages today.
    dts: false,
    define: {
      // Selects the vdom function form of shared dual-mode directives.
      __VUEFORM_VAPOR__: 'false',
    },
    deps: { neverBundle: adapterTsdownExternal(options) },
    treeshake: { moduleSideEffects: CSS_SIDE_EFFECT_RULES },
    outputOptions: {
      banner: indexBanner(options.name, root),
    },
    plugins: [
      pruneModules(),
      namespaceExports(),
      sourceSideEffects(STYLES_SIDECARS),
      scssExternals(options.name, scssAbs, SRC_ALIAS),
      srcAlias(SRC_ALIAS, srcAbs),
      themeScss(
        root,
        scssAbs,
        resolve(outAbs, 'scss'),
        resolve(outAbs, 'css'),
        { '@vueform/core': '../core/src/scss' }
      ),
      themeCss(
        root,
        resolve(scssAbs, 'theme.scss'),
        resolve(outAbs, 'css'),
        resolve(outAbs, 'css/theme.css'),
        resolve(outAbs, 'scss/theme.scss')
      ),
      Vue({
        isProduction: true,
        template: { compilerOptions: { comments: false } },
      }),
      dtsRewrites(outAbs, rewrites, { [SRC_ALIAS]: outAbs }),
      componentNames(resolve(outAbs, 'components')),
      ...(options.cdn ? [cdnBuild({ name: options.name }, root, srcAbs)] : []),
    ],
  }
}

/**
 * tsdown config factory for an adapter's VAPOR build — the counterpart of the
 * vite factory's nested `vf:vapor-build`: the `src/components` tree plus the
 * theme/exports-promised entries emitted into `dist/vapor`, compiled by the 3.6
 * vapor compiler, everything else resolved to the main dist, and external
 * `@vueform/core` component subpaths pointed at core's vapor tree.
 */
export async function createAdapterVaporTsdownConfig(
  options: AdapterTsdownOptions
): Promise<UserConfig> {
  const { default: Vue } = await import('unplugin-vue/rolldown')

  const root = process.cwd()
  const srcAbs = resolve(root, 'src')
  const componentsAbs = resolve(srcAbs, 'components')
  const toolsAbs = resolve(srcAbs, 'tools')
  const dualTrees = [componentsAbs, toolsAbs].filter(existsSync)
  const outDir = 'dist/vapor'

  const consumerRequire = createRequire(join(root, 'package.json'))
  const VaporCompiler = consumerRequire('vue-compiler-sfc-vapor')
  VaporCompiler.registerTS(() => consumerRequire('typescript'))

  const entries: Record<string, string> = {}
  for (const tree of dualTrees) {
    const prefix = relative(srcAbs, tree)
    for (const [name, file] of Object.entries(mirrorEntries(tree))) {
      entries[`${prefix}/${name}`] = file
    }
  }
  for (const theme of themeNames(srcAbs)) {
    entries[theme] = resolve(srcAbs, `${theme}.ts`)
  }
  for (const name of exportedVaporEntries(root, srcAbs)) {
    entries[name] = resolve(srcAbs, `${name}.ts`)
  }
  // Stray SFCs and the barrels re-exporting them or the tools tree — see the
  // core vapor factory. Adapters have none today; kept uniform so one
  // appearing tomorrow builds correctly without factory changes.
  Object.assign(entries, sfcMirrorEntries(srcAbs, [componentsAbs]))
  const sfcBarrels = sfcReexportClosure(srcAbs, dualTrees, [toolsAbs])
  for (const file of sfcBarrels) {
    entries[relative(srcAbs, file).replace(/\.ts$/, '')] = file
  }

  return {
    entry: entries,
    unbundle: true,
    format: ['es'],
    outDir,
    outExtensions: JS_DTS,
    platform: 'neutral',
    minify: false,
    target: false,
    dts: false,
    define: {
      // Selects the vapor function form of shared dual-mode directives.
      __VUEFORM_VAPOR__: 'true',
    },
    inputOptions: {
      // The vapor-externals plugin rewrites the absolute main-dist ids
      // itself (relative to each chunk) — rolldown must not pre-relativize
      // them against the package root.
      makeAbsoluteExternalsRelative: false,
    },
    deps: { neverBundle: adapterTsdownExternal(options) },
    treeshake: { moduleSideEffects: CSS_SIDE_EFFECT_RULES },
    outputOptions: {
      // Point external imports of core's dual-compiled trees (components,
      // tools) at core's vapor copies.
      paths: (id: string) =>
        id.startsWith('@vueform/core/components/')
          ? id.replace(
              '@vueform/core/components/',
              '@vueform/core/vapor/components/'
            )
          : id === '@vueform/core/tools'
            ? '@vueform/core/vapor/tools'
            : id,
    },
    plugins: [
      pruneModules(),
      namespaceExports(),
      sourceSideEffects(STYLES_SIDECARS),
      scssExternals(options.name, resolve(srcAbs, 'scss'), SRC_ALIAS),
      srcAlias(SRC_ALIAS, srcAbs),
      vaporExternals(
        root,
        srcAbs,
        resolve(root, outDir),
        dualTrees,
        sfcBarrels
      ),
      Vue({
        isProduction: true,
        compiler: VaporCompiler,
        features: { vapor: true },
        template: { compilerOptions: { comments: false } },
      }),
    ],
  }
}
