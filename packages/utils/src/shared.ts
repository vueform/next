import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import { basename, dirname, join, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

import type { BuildOptions, Plugin } from 'vite'

import { injectShorthandPropsDts } from './shorthands'

interface SassCompiler {
  compile(
    path: string,
    options?: { style?: string; importers?: unknown[] }
  ): { css: string }
}

export interface LibBuildOptions {
  /**
   * The package's published name — used as the lib name.
   */
  name: string
  /**
   * Entry map: output name (relative, no extension) to absolute source file.
   */
  entries: Record<string, string>
  /**
   * `preserveModulesRoot` — the source directory the output tree mirrors.
   */
  preserveRoot: string
  /**
   * Output directory relative to the package root.
   */
  outDir: string
  /**
   * The full external list (nothing is added implicitly here).
   */
  external: (string | RegExp)[]
  /**
   * Keep bare external `.css` imports side-effectful (adapters' per-component
   * styles modules); vite's default treeshake profile would strip them.
   */
  cssExternalSideEffects?: boolean
  /**
   * Keep entry chunks free of hoisted transitive side-effect imports (theme
   * CSS) — those must stay attached to the component modules so consumers'
   * per-binding tree shaking drops unused components' CSS.
   */
  noHoistTransitiveImports?: boolean
}

export const SHORTHANDS_VIRTUAL = '\0vueform-shorthands-marker'

// Served in place of the real .css/.scss under the "node" exports condition
// so plain Node (SSR with externalized deps, test runners) can evaluate
// modules that import theme files. Bundlers resolve the actual stylesheet via
// the "default" condition. The empty-string default matters: Nuxt's SSR
// inlineStyles feature imports a stylesheet module's default export to inline
// it, and a shim without one breaks the nitro server build.
const CSS_NODE_SHIM = "export default ''\n"

/**
 * Externalizes every import that resolves inside `srcAbs` but outside the
 * `keep` directories to the corresponding main-dist module, as a relative path
 * escaping the vapor output directory. Relative specifiers bypass the package's
 * exports map, so internals stay private, and sharing the main-dist modules
 * keeps stateful ones (tokens, registries, contexts) single-instance across
 * both modes. Modules whose main-dist file does not exist (pruned type-only
 * modules) stay internal and tree-shake away as usual.
 *
 * Externals are resolved to absolute dist paths and rewritten to per-chunk
 * relative specifiers in `generateBundle` (rollup's
 * `makeAbsoluteExternalsRelative` relativizes against the wrong base for nested
 * outDirs — set it to `false`).
 */
/**
 * Resolves a source-internal import specifier (relative, or `#alias/...` rooted
 * at src) to a file, mirroring the build's resolution closely enough for graph
 * walking. External package specifiers return null.
 */
function resolveSourceSpec(
  spec: string,
  fromDir: string,
  srcAbs: string
): string | null {
  let base: string
  if (spec.startsWith('.')) {
    base = resolve(fromDir, spec)
  } else if (spec.startsWith('#')) {
    const rest = spec.split('/').slice(1).join('/')
    if (!rest) return null
    base = resolve(srcAbs, rest)
  } else {
    return null
  }

  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.vue`,
    join(base, 'index.ts'),
  ]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
  }
  return null
}

/**
 * The transitive closure of dual-mode source modules: files that reference the
 * `__VUEFORM_VAPOR__` compile-time define, plus everything that imports them
 * (directly or through barrels). The main dist compiles these with the define
 * off, so the vapor build must compile its own copies — resolving any of them
 * to the main dist would hand the vapor tree vdom-mode behavior (e.g. an
 * object-format directive the vapor runtime cannot apply).
 */
function dualModeClosure(srcAbs: string): Set<string> {
  const files: string[] = []
  ;(function walk(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, entry.name)
      if (entry.isDirectory()) walk(abs)
      else if (/\.(ts|vue)$/.test(entry.name) && !entry.name.endsWith('.d.ts'))
        files.push(abs)
    }
  })(srcAbs)

  const importers = new Map<string, string[]>()
  const seeds: string[] = []

  for (const file of files) {
    const source = readFileSync(file, 'utf8')
    if (source.includes('__VUEFORM_VAPOR__')) seeds.push(file)

    for (const match of source.matchAll(
      /(?:from\s+|import\(\s*)['"]([^'"]+)['"]/g
    )) {
      const dep = resolveSourceSpec(match[1], dirname(file), srcAbs)
      if (!dep) continue
      let list = importers.get(dep)
      if (!list) importers.set(dep, (list = []))
      list.push(file)
    }
  }

  const closure = new Set<string>()
  const queue = [...seeds]
  while (queue.length) {
    const file = queue.pop()!
    if (closure.has(file)) continue
    closure.add(file)
    queue.push(...(importers.get(file) ?? []))
  }

  return closure
}

/**
 * The pnpm workspace root above `from` — the anchor for cross-package paths
 * (e.g. a tool run in an adapter reading the core package's artifacts).
 */
export function findWorkspaceRoot(from: string): string {
  let dir = from
  for (;;) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) return dir
    const parent = dirname(dir)
    if (parent === dir) {
      throw new Error(`No pnpm-workspace.yaml found above ${from}.`)
    }
    dir = parent
  }
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Resolves the `#shorthands` marker (a type-only import in component
 * `unstyled.ts` files) to an empty, side-effect-free virtual module, so Rollup
 * tree-shakes the import away entirely. The type side is covered by the ambient
 * `declare module '#shorthands'` in the root tsconfig's include.
 */
export function shorthandsMarker(): Plugin {
  return {
    name: 'vf:shorthands-marker',
    resolveId(id) {
      if (id === '#shorthands') {
        return { id: SHORTHANDS_VIRTUAL, moduleSideEffects: false }
      }
    },
    load(id) {
      if (id === SHORTHANDS_VIRTUAL) return 'export {}'
    },
  }
}

/**
 * Drops two kinds of dead chunks that `preserveModules` keeps around:
 *
 * - Empty chunks: type-only source modules (interfaces, type aliases) compile to
 *   empty `.mjs` files — their `.d.ts` is the real output. Nothing imports
 *   them, since Rollup already tree-shakes imports of empty side-effect-free
 *   modules.
 * - Orphaned SFC facades (`VfButton2.vue.mjs`): plugin-vue splits an SFC into a
 *   facade module and a script sub-module. Rollup traces re-exports to the
 *   script sub-module (which claims the `.vue.mjs` chunk name), leaving the
 *   facade as a pure default re-export chunk that nothing imports.
 */
/**
 * JS-level source alias for the tsdown factories: resolves `<find>` and
 * `<find>/x` into the package's `src`. Used INSTEAD of rolldown's native
 * `resolve.alias`, which resolves before JS `resolveId` hooks run and would
 * bypass plugins that must see the raw alias specifier (`scssExternals`).
 */
export function srcAlias(find: string, srcAbs: string): Plugin {
  return {
    name: 'vf:src-alias',
    async resolveId(source, importer, options) {
      if (source !== find && !source.startsWith(`${find}/`)) return
      const mapped =
        source === find
          ? join(srcAbs, 'index')
          : join(srcAbs, source.slice(find.length + 1))
      const resolved = await this.resolve(mapped, importer, {
        ...options,
        skipSelf: true,
      })
      return resolved ?? mapped
    },
  }
}

/**
 * Marks matching SOURCE modules as side-effectful during the build.
 *
 * Vite's resolver applies the package's own `sideEffects` globs to workspace
 * source files; those globs describe the published dist layout, so a source
 * module like `src/components/VfText/styles.ts` (whose only job is its css
 * side-effect imports) is wrongly treated as side-effect-free and Rolldown
 * drops the `styled → styles` import edge. Marking at transform time keeps the
 * published package.json free of src paths.
 */
export function sourceSideEffects(tests: RegExp[]): Plugin {
  return {
    name: 'vf:source-side-effects',
    transform(code, id) {
      if (!tests.some((test) => test.test(id))) return
      return { code, map: null, moduleSideEffects: true }
    },
  }
}

/**
 * Restores consumer-side namespace reification under Rolldown (vite 8).
 *
 * `import * as ns from './barrel'` across preserved modules makes Rolldown
 * materialize the namespace as an `__exportAll({...})` object INSIDE the barrel
 * chunk and export it (`components_exports`). That extra export eagerly
 * references every binding of the barrel, so consumers bundling any import of
 * the barrel lose all tree-shaking (measured: the minimal ui bundle grew ~5x).
 * Rollup instead reified the namespace in the consuming chunk, keeping the
 * barrel clean.
 *
 * This pass rewrites the emitted chunks back to the Rollup shape:
 *
 * - consuming chunks: `import { x_exports } from "spec"` becomes `import * as
 *   x_exports from "spec"` (named siblings are kept),
 * - defining chunks: the `var x_exports = __exportAll({...});` block, the
 *   `x_exports` entry in the final export statement, and the then-unused
 *   `__exportAll` import are removed.
 */
export function namespaceExports(): Plugin {
  const EXPORTS_NAME = /^\w+_exports$/
  return {
    name: 'vf:namespace-exports',
    generateBundle(_, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue
        let code = output.code

        // Consumer side: named `x_exports` imports become namespace imports.
        code = code.replace(
          /^import \{([^}]+)\} from ("[^"]+");$/gm,
          (statement, names: string, spec: string) => {
            const parts = names.split(',').map((part) => part.trim())
            const ns = parts.filter((part) => EXPORTS_NAME.test(part))
            if (ns.length === 0) return statement
            const rest = parts.filter((part) => !EXPORTS_NAME.test(part))
            return [
              ...ns.map((name) => `import * as ${name} from ${spec};`),
              ...(rest.length
                ? [`import { ${rest.join(', ')} } from ${spec};`]
                : []),
            ].join('\n')
          }
        )

        // Definer side: drop the materialized namespace object and its
        // export — but only for names the chunk actually EXPORTS. An IIFE or
        // inlined bundle reifies the same `x_exports` pattern for internal
        // use; those must stay.
        const exported = new Set<string>()
        for (const match of code.matchAll(/^export \{([^}]+)\};/gm)) {
          for (const part of match[1].split(',')) {
            const name = part.trim()
            if (EXPORTS_NAME.test(name)) exported.add(name)
          }
        }
        if (exported.size > 0) {
          code = code.replace(
            /^var (\w+_exports) = __exportAll\(\{[^{}]*\}\);\n?/gm,
            (statement, name: string) => (exported.has(name) ? '' : statement)
          )
          code = code.replace(
            /^export \{([^}]+)\};/gm,
            (statement, names: string) => {
              const kept = names
                .split(',')
                .map((part) => part.trim())
                .filter((part) => !EXPORTS_NAME.test(part))
              return kept.length ? `export { ${kept.join(', ')} };` : ''
            }
          )
          if (!/\b__exportAll\(/.test(code)) {
            code = code.replace(
              /^import \{ __exportAll \} from "[^"]+";\n?/gm,
              ''
            )
          }
        }

        output.code = code
      }
    },
  }
}

export function pruneModules(): Plugin {
  return {
    name: 'vf:prune-modules',
    generateBundle(_, bundle) {
      // Deleting an empty chunk can leave bare side-effect imports of it
      // dangling in other chunks (rolldown keeps glue imports that rollup
      // dropped); strip those and re-check, until stable.
      for (;;) {
        const deleted = new Set<string>()
        for (const [file, output] of Object.entries(bundle)) {
          if (output.type === 'chunk' && !output.code.trim()) {
            delete bundle[file]
            deleted.add(file)
          }
        }
        if (deleted.size === 0) break
        for (const [file, output] of Object.entries(bundle)) {
          if (output.type !== 'chunk') continue
          output.code = output.code.replace(
            /^import\s+"([^"]+)";\n?/gm,
            (statement, spec: string) => {
              if (!spec.startsWith('.')) return statement
              const target = join(file, '..', spec).split(sep).join('/')
              return deleted.has(target) ? '' : statement
            }
          )
        }
      }

      const imported = new Set<string>()
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue
        for (const dep of [...output.imports, ...output.dynamicImports]) {
          imported.add(dep)
        }
      }
      for (const [file, output] of Object.entries(bundle)) {
        if (output.type !== 'chunk' || output.isEntry || imported.has(file)) {
          continue
        }
        if (
          /^import (\w+) from "[^"]+";\s*export \{\s*\1 as default\s*\};$/.test(
            output.code.trim()
          )
        ) {
          delete bundle[file]
        }
      }
    },
  }
}

/**
 * Externalizes relative imports of the package's own theme chunk sources
 * (`src/scss/<chunk>.scss`) to the published `<name>/<chunk>.css` subpaths, so
 * source can reference the real scss files while dist modules carry the bare
 * self-referencing specifiers the exports map serves (real CSS for bundlers,
 * Node shims otherwise). The chunks themselves are compiled separately
 * (`themeScss`) — they never enter the bundle graph.
 */
export function scssExternals(
  name: string,
  scssAbs: string,
  aliasPrefix?: string
): Plugin {
  return {
    name: 'vf:scss-externals',
    enforce: 'pre',
    resolveId(source, importer) {
      const [path] = source.split('?')
      if (!path.endsWith('.scss')) return
      // Raw alias form (`#ui/scss/x.scss`): under tsdown/rolldown there is
      // no earlier alias plugin feeding this hook absolute ids — rolldown's
      // native `resolve.alias` would bypass JS resolveId hooks entirely, so
      // the tsdown factories alias via plugins and this hook claims the
      // alias-form scss imports directly.
      if (aliasPrefix && path.startsWith(`${aliasPrefix}/scss/`)) {
        return {
          id: `${name}/${basename(path, '.scss')}.css`,
          external: true,
          moduleSideEffects: true,
        }
      }
      // Vite's alias pass runs before pre plugins, so an aliased specifier
      // may arrive already resolved to an absolute path.
      const abs = path.startsWith('.')
        ? importer
          ? resolve(dirname(importer), path)
          : path
        : path
      if (dirname(abs) !== scssAbs) return
      // `moduleSideEffects` on the resolution itself: the global
      // `treeshake.moduleSideEffects` function is not honored for external
      // modules by Rolldown (vite 8), which silently dropped these css
      // side-effect imports from the emitted modules.
      return {
        id: `${name}/${basename(abs, '.scss')}.css`,
        external: true,
        moduleSideEffects: true,
      }
    },
  }
}

/**
 * Copies the theme scss sources into dist verbatim and compiles each 1:1 to a
 * css chunk, with a Node exports-condition shim beside every file. Mixin-only
 * partials that compile to empty css keep their scss copy but get no css chunk
 * — their rules ship inside the chunks that `@use` them. `theme.scss` is the
 * aggregate recipe — handled by `themeCss`, never compiled or copied as a
 * chunk. `importMap` resolves package-specifier `@use`/`@forward` in the
 * sources (sass has no node resolution of its own).
 */
export function themeScss(
  root: string,
  srcScss: string,
  outScss: string,
  outCss: string,
  importMap: Record<string, string> = {}
): Plugin {
  return {
    name: 'vf:theme-scss',
    closeBundle() {
      if (!existsSync(srcScss)) return

      const sass = loadSassCompiler(root)
      const importers = [
        {
          findFileUrl(url: string) {
            for (const [prefix, dir] of Object.entries(importMap)) {
              if (url.startsWith(`${prefix}/`)) {
                return pathToFileURL(
                  resolve(root, dir, url.slice(prefix.length + 1))
                )
              }
            }
            return null
          },
        },
      ]

      mkdirSync(outScss, { recursive: true })
      mkdirSync(outCss, { recursive: true })

      for (const file of readdirSync(srcScss)) {
        if (!file.endsWith('.scss') || file === 'theme.scss') continue
        const name = basename(file, '.scss')

        copyFileSync(resolve(srcScss, file), resolve(outScss, file))
        writeFileSync(resolve(outScss, `${file}.mjs`), CSS_NODE_SHIM)

        const result = sass.compile(resolve(srcScss, file), {
          style: 'expanded',
          importers,
        })
        // Mixin-only partials compile to nothing but their doc comments.
        if (!result.css.replace(/\/\*[\s\S]*?\*\//g, '').trim()) continue
        writeFileSync(resolve(outCss, `${name}.css`), result.css)
        writeFileSync(resolve(outCss, `${name}.css.mjs`), CSS_NODE_SHIM)
      }
    },
  }
}

/**
 * Emits a single flattened stylesheet (for `<link>`/CDN consumers) from an
 * aggregate recipe scss, by concatenating the compiled chunks its `@use
 * '…<chunk>.scss'` lines list, in order. The recipe itself is copied beside the
 * shipped scss sources. Runs after `themeScss` (same-build `closeBundle`
 * ordering), so the chunks exist.
 */
export function themeCss(
  root: string,
  recipe: string,
  chunksDir: string,
  out: string,
  recipeOut: string
): Plugin {
  return {
    name: 'vf:theme-css',
    closeBundle() {
      if (!existsSync(recipe)) return

      const scss = readFileSync(recipe, 'utf-8')
      const refs = [
        ...scss.matchAll(/@use\s+["'][^"']*?([\w-]+)\.s?css["']/g),
      ].map((m) => m[1])
      if (refs.length === 0) {
        throw new Error(
          `vf:theme-css: no @use '…<chunk>.scss' lines found in ${recipe}`
        )
      }
      const flattened = refs
        .map((name) => {
          const cssPath = resolve(chunksDir, `${name}.css`)
          if (!existsSync(cssPath)) {
            throw new Error(
              `vf:theme-css: recipe references missing chunk: ${name}.css`
            )
          }
          return readFileSync(cssPath, 'utf-8').trim()
        })
        .join('\n\n')

      mkdirSync(dirname(out), { recursive: true })
      writeFileSync(out, `${flattened}\n`)
      // Node exports-condition shim, same as the per-chunk ones.
      writeFileSync(`${out}.mjs`, CSS_NODE_SHIM)
      mkdirSync(dirname(recipeOut), { recursive: true })
      copyFileSync(recipe, recipeOut)
      writeFileSync(`${recipeOut}.mjs`, CSS_NODE_SHIM)
    },
  }
}

/**
 * Loads sass from the consuming package's dependencies, not ours.
 */
export function loadSassCompiler(root: string): SassCompiler {
  const consumerRequire = createRequire(join(root, 'package.json'))
  try {
    return consumerRequire('sass')
  } catch {
    try {
      return consumerRequire('sass-embedded')
    } catch {
      throw new Error(
        '@vueform/utils requires "sass" or "sass-embedded" to compile theme scss'
      )
    }
  }
}

/**
 * The shared library build shape: an ES-modules mirror of the entry tree via
 * `preserveModules`, one `.mjs` per source module, no minification, expected
 * `EMPTY_BUNDLE` warnings silenced (their chunks are pruned).
 */
export function createLibBuild(options: LibBuildOptions): BuildOptions {
  return {
    minify: false,
    lib: {
      formats: ['es'],
      name: options.name,
      fileName: (_, name) => `${name}.mjs`,
      entry: options.entries,
    },
    outDir: options.outDir,
    cssCodeSplit: true,
    rollupOptions: {
      external: options.external,
      ...(options.cssExternalSideEffects
        ? {
            treeshake: {
              // Rule array, not a function: under vite 8 (Rolldown) the
              // function form is not applied — rules are evaluated natively
              // (first match wins) and survive the Rust boundary. Semantics
              // match the previous function: external css imports are
              // side-effectful (they must stay in the emitted modules),
              // other externals are not, local modules always are.
              moduleSideEffects: [
                { test: /\.css$/, sideEffects: true, external: true },
                { sideEffects: false, external: true },
                { sideEffects: true, external: false },
              ],
            },
          }
        : {}),
      onwarn(warning, warn) {
        // Expected for type-only modules; their empty chunks are pruned.
        if (warning.code === 'EMPTY_BUNDLE') return
        warn(warning)
      },
      output: {
        preserveModules: true,
        preserveModulesRoot: options.preserveRoot,
        entryFileNames: '[name].mjs',
        ...(options.noHoistTransitiveImports
          ? { hoistTransitiveImports: false }
          : {}),
      },
    },
  }
}

export function vaporExternals(
  root: string,
  srcAbs: string,
  outAbs: string,
  keep: string[]
): Plugin {
  const distAbs = resolve(root, 'dist')
  const dualMode = dualModeClosure(srcAbs)

  return {
    name: 'vf:vapor-externals',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!importer || source.startsWith('\0')) return
      const resolved = await this.resolve(source, importer, {
        ...options,
        skipSelf: true,
      })
      if (!resolved || resolved.external) return
      const [file] = resolved.id.split('?')
      if (!file.startsWith(srcAbs + sep)) return
      if (keep.some((dir) => file.startsWith(dir + sep))) return
      // SFCs must never resolve to the main dist: that file is vdom-compiled,
      // and a vdom component inside a vapor tree renders nothing. Keeping the
      // .vue internal lets this build vapor-compile it (stateless by
      // definition here — stateful modules are .ts and stay shared).
      if (file.endsWith('.vue')) return
      // Same for dual-mode modules keyed on the __VUEFORM_VAPOR__ define and
      // everything importing them (e.g. a config barrel registering a
      // directive with an object vdom form and a function vapor form): the
      // main-dist copies were compiled with the define off.
      if (dualMode.has(file)) return
      const rel = relative(srcAbs, file).replace(/\.ts$/, '')
      const distFile = resolve(distAbs, `${rel}.mjs`)
      if (!existsSync(distFile)) return
      return { id: distFile, external: true }
    },

    generateBundle(_, bundle) {
      const externalRe = new RegExp(
        `(["'])(${escapeRegExp(distAbs)}/[^"']+)\\1`,
        'g'
      )
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue
        const chunkDir = resolve(outAbs, output.fileName, '..')
        output.code = output.code.replace(externalRe, (_m, quote, abs) => {
          let rel = relative(chunkDir, abs).split(sep).join('/')
          if (!rel.startsWith('.')) rel = `./${rel}`
          return `${quote}${rel}${quote}`
        })
      }
    },
  }
}

/**
 * Entry map mirroring every `.ts` module under `dir` (minus declarations) at
 * its own path.
 */
export function mirrorEntries(dir: string): Record<string, string> {
  const entries: Record<string, string> = {}
  ;(function walk(current: string) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const abs = join(current, entry.name)
      if (entry.isDirectory()) {
        walk(abs)
      } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
        entries[relative(dir, abs).replace(/\.ts$/, '')] = abs
      }
    }
  })(dir)
  return entries
}

/**
 * After the d.ts files are written, injects the `part:*` / `class:*` /
 * `reclass:*` shorthand prop types for every component whose tier entry
 * (`styled.d.ts` / `unstyled.d.ts`) carries the `#shorthands` marker import: a
 * `shorthands.d.ts` declaration merge is written beside it and the marker
 * import is rewritten to `./shorthands`. `helpersFrom` is the specifier the
 * generated files import the prop helpers from — `'../../types'` in core,
 * `'@vueform/core'` in adapters.
 */
export function shorthandProps(
  distAbs: string,
  helpersFrom: string,
  srcComponentsDir?: string
): Plugin {
  return {
    name: 'vf:shorthand-props',
    enforce: 'post',
    closeBundle() {
      const { written, skipped } = injectShorthandPropsDts(distAbs, {
        helpersFrom,
        srcComponentsDir,
      })
      if (written > 0) {
        const skipNote =
          skipped.length > 0
            ? ` (skipped ${skipped.length}: ${skipped.slice(0, 3).join('; ')}${skipped.length > 3 ? '…' : ''})`
            : ''

        console.info(
          `[vf:shorthand-props] wrote ${written} shorthands.d.ts${skipNote}`
        )
      }
    },
  }
}

/**
 * Writes `names.d.ts` beside the built components: a component-name union with
 * ZERO imports — nuxt module options (and any other name-level tooling) can
 * reference it without pulling the barrel's d.ts, whose per-component
 * augmentations would otherwise register every element type program-wide.
 */
export function componentNames(componentsDistAbs: string): Plugin {
  return {
    name: 'vf:component-names',
    enforce: 'post',
    closeBundle() {
      if (!existsSync(componentsDistAbs)) return
      const names = readdirSync(componentsDistAbs, { withFileTypes: true })
        .filter((e) => e.isDirectory() && e.name.startsWith('Vf'))
        .map((e) => `'${e.name}'`)
      if (!names.length) return
      writeFileSync(
        resolve(componentsDistAbs, 'names.d.ts'),
        '// AUTO-GENERATED by @vueform/utils — do not edit.\n' +
          `export type ComponentNames =\n  | ${names.join('\n  | ')}\n`
      )
    },
  }
}
