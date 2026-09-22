import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, posix, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  injectShorthandPropsDts,
  stripShorthandMarkerFromCode,
  type ShorthandPropsOptions,
} from './shorthandProps'
import type { Plugin } from 'vite'

interface SassCompiler {
  compile(
    path: string,
    options?: { style?: string; importers?: unknown[] }
  ): { css: string }
}

export interface ThemeScssOptions {
  /**
   * Directory containing .scss source files (relative to project root)
   */
  srcDir: string
  /**
   * Output directory the .scss sources are copied to verbatim, with Node
   * exports-condition stubs beside them (relative to project root) — so
   * consumers can compose from the sources (mixin-only partials included, which
   * have no compiled counterpart).
   */
  outDir: string
  /**
   * When set, the sources are also compiled 1:1 into this directory as .css
   * chunks with Node shims (relative to project root). Omit for packages that
   * only ship the scss without compiling it themselves.
   */
  cssOutDir?: string
  /**
   * Package-specifier prefixes the sources may @use/@forward, mapped to the
   * directory (relative to project root) holding those scss files — e.g. `{
   * '@vueform/core': '../core/src/scss' }`.
   */
  importMap?: Record<string, string>
}

export interface ThemeCssOptions {
  /**
   * The aggregate recipe `.scss` whose `@use '...<chunk>.scss|css'` lines
   * define the flattened stylesheet's content and order (relative to project
   * root).
   */
  recipe: string
  /**
   * Directory holding the compiled chunk `.css` files the recipe references
   * (relative to project root). Defaults to `dist/css`.
   */
  chunksDir?: string
  /**
   * Compiled-chunk directories for recipe references into OTHER packages, keyed
   * by specifier prefix — e.g. `{ '@vueform/core': '../core/dist/css' }`.
   */
  resolve?: Record<string, string>
  /**
   * Output path of the flattened stylesheet (relative to project root).
   * Defaults to `dist/css/theme.css` — inside the chunk directory, so the
   * `./*.css` exports pattern serves it like any chunk.
   */
  out?: string
  /**
   * Where to copy the recipe scss itself (relative to project root), e.g.
   * `dist/scss/theme.scss`. Skipped when omitted.
   */
  recipeOut?: string
}

export interface ThemeStylesOptions {
  /**
   * Theme names to process
   */
  themes: string[]
  /**
   * Default theme name (only used in nested/non-flat mode)
   */
  defaultTheme?: string
  /**
   * Directory containing per-theme SCSS sources (relative to project root). In
   * nested mode this is the parent of per-theme directories (e.g.
   * `src/themes`). In flat mode this is the directory containing `index.scss`
   * (e.g. `src/theme`).
   */
  scssDir: string
  /**
   * When true, theme JS may live at `dist/<name>.mjs` or
   * `dist/<name>/index.mjs` (single-theme adapters), and the consolidated
   * CSS/SCSS is written to the dist root (`index.css`, `index.scss`) with no
   * `themes/` subdirectory.
   */
  flat?: boolean
}

export interface VfBuildOptions {
  /**
   * Compile theme SCSS files to CSS after the bundle is written. Mixin-only
   * partials that compile to empty CSS are skipped, and every emitted chunk
   * gets a `<name>.css.mjs` Node exports-condition shim beside it.
   */
  themeScss?: ThemeScssOptions
  /**
   * Emit a single flattened stylesheet (for `<link>`/CDN consumers) from an
   * aggregate recipe scss, by concatenating the compiled chunks it lists.
   */
  themeCss?: ThemeCssOptions
  /**
   * Emit consolidated per-theme stylesheets after the bundle is written.
   */
  themeStyles?: ThemeStylesOptions
  /**
   * Emit a `dist/index.d.mts` shim that re-exports from the main `.d.ts`
   * declarations. This ensures module augmentation works correctly when
   * consumers have `allowJs: true` in their tsconfig (e.g. Nuxt projects).
   */
  emitDmts?: boolean

  /**
   * Inject `part:*` / `class:*` / `reclass:*` shorthand prop types into dist
   * for every component whose default tier entry (styled.ts / unstyled.ts)
   * imports the `#shorthands` marker.
   *
   * The marker is stripped from runtime JS; in the emitted tier `.d.ts` it is
   * rewritten to `./shorthands` and a matching `shorthands.d.ts` declaration
   * merge is written beside it.
   */
  shorthandProps?: ShorthandPropsOptions
}

function resolveFlatThemeMjs(dist: string, name: string): string | undefined {
  const candidates = [
    resolve(dist, `${name}.mjs`),
    resolve(dist, name, 'index.mjs'),
  ]
  return candidates.find((path) => existsSync(path))
}

function relativeImport(fromFile: string, toFile: string): string {
  let rel = relative(dirname(fromFile), toFile).replace(/\\/g, '/')
  if (!rel.startsWith('.')) rel = `./${rel}`
  return rel
}

function loadSassCompiler(): SassCompiler {
  try {
    return require('sass')
  } catch {
    try {
      return require('sass-embedded')
    } catch {
      throw new Error(
        'vfBuild({ themeScss }) requires "sass" or "sass-embedded" as a peer dependency'
      )
    }
  }
}

const SHORTHANDS_VIRTUAL = '\0vueform-shorthands-marker'

// Served in place of the real .css under the "node" exports condition so
// plain Node (SSR with externalized deps, test runners) can evaluate modules
// that import theme chunks. Bundlers resolve the actual stylesheet via the
// "default" condition.
const CSS_NODE_SHIM = 'export {}\n'

function writeCssWithShim(outDir: string, name: string, css: string) {
  writeFileSync(resolve(outDir, `${name}.css`), css)
  writeFileSync(resolve(outDir, `${name}.css.mjs`), CSS_NODE_SHIM)
}

/**
 * Externalizes relative imports of the package's own theme chunk sources
 * (`src/scss/<chunk>.scss`) to the published `<pkg>/<chunk>.css` subpaths, so
 * source can reference the real scss files while dist modules carry the bare
 * self-referencing specifiers the exports map serves (real CSS for bundlers,
 * Node shims otherwise). The chunks themselves are compiled separately
 * (`themeScss`) — they never enter the bundle graph.
 */
function scssExternals(): Plugin {
  let pkgName = ''
  let scssDir = ''

  return {
    name: 'vf-build:scss-externals',
    enforce: 'pre',

    configResolved(config) {
      scssDir = resolve(config.root, 'src/scss')
      try {
        pkgName = JSON.parse(
          readFileSync(resolve(config.root, 'package.json'), 'utf-8')
        ).name
      } catch {
        pkgName = ''
      }
    },

    resolveId(source, importer) {
      if (!pkgName) return
      const [path] = source.split('?')
      if (!path.endsWith('.scss')) return
      // Vite's alias pass runs before pre plugins, so '@/scss/x.scss' may
      // arrive already resolved to an absolute path.
      const abs = path.startsWith('.')
        ? importer
          ? resolve(dirname(importer), path)
          : path
        : path
      if (dirname(abs) !== scssDir) return
      return { id: `${pkgName}/${basename(abs, '.scss')}.css`, external: true }
    },
  }
}

export default function vfBuild(options: VfBuildOptions = {}): Plugin[] {
  let root = ''
  let outDir = ''

  const main: Plugin = {
    name: 'vf-build',
    enforce: 'post',

    configResolved(config) {
      root = config.root
      outDir = config.build.outDir
    },

    // Empty marker module so `import '#shorthands'` resolves in any Vite
    // pipeline that loads this plugin (build). Tests / playgrounds that do
    // not use vf-build need their own alias — see package vitest configs.
    resolveId(id) {
      if (id === '#shorthands') return SHORTHANDS_VIRTUAL
    },

    load(id) {
      if (id === SHORTHANDS_VIRTUAL) return 'export {}'
    },

    // ------------------------------------------------------------------
    // generateBundle: barrel-import rewrites + CSS asset management
    // ------------------------------------------------------------------
    generateBundle(_, bundle) {
      // 1) Rename CSS assets owned by a single chunk so the filename
      //    matches the chunk (e.g. origin.mjs → origin.css).
      const cssUsage = new Map<string, Set<string>>()
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type !== 'chunk') continue
        const imported = chunk.viteMetadata?.importedCss
        if (!imported) continue
        for (const cssPath of imported) {
          if (!cssUsage.has(cssPath)) cssUsage.set(cssPath, new Set())
          cssUsage.get(cssPath)!.add(fileName)
        }
      }

      const cssRenames = new Map<string, string>()
      for (const [cssPath, owners] of cssUsage) {
        if (owners.size !== 1) continue
        const ownerChunk = owners.values().next().value as string
        const newPath = ownerChunk.replace(/\.m?jsx?$/, '') + '.css'
        if (newPath === cssPath) continue
        if (bundle[newPath]) continue
        cssRenames.set(cssPath, newPath)
      }

      for (const [oldPath, newPath] of cssRenames) {
        const asset = bundle[oldPath]
        if (!asset || asset.type !== 'asset') continue
        asset.fileName = newPath
        delete bundle[oldPath]
        bundle[newPath] = asset
      }

      // CSS specifiers carried by component tier modules — Rollup also
      // hoists copies of these into barrels/entries, which must be stripped
      // there or consumers can no longer tree-shake unused components' CSS.
      // Other external CSS imports (e.g. full.ts -> theme.css) stay.
      const componentCss = new Set<string>()
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type !== 'chunk') continue
        if (!/^components\/[^/]+\//.test(fileName)) continue
        for (const m of chunk.code.matchAll(
          /import\s*["'](@vueform\/[\w-]+\/[\w-]+\.css)["']/g
        )) {
          componentCss.add(m[1])
        }
      }

      // 2) Per-chunk rewrites.
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type !== 'chunk') continue

        // The tier a component's default subpath serves: `styled` when the
        // adapter attaches CSS, else `unstyled` (core and CSS-less adapters).
        const defaultTier = (name: string) =>
          bundle[`components/${name}/styled.mjs`] ? 'styled' : 'unstyled'

        // Rewrite barrel re-exports so consumers import from the default
        // tier entry (type augmentation + styles where the adapter has them)
        // instead of the plain component index.
        if (/^components\/[^/]+\.mjs$/.test(fileName)) {
          chunk.code = chunk.code.replace(
            /from\s+["']\.\/(Vf[^/]+)\/index\.mjs["']/g,
            (_, name) => `from "./${name}/${defaultTier(name)}.mjs"`
          )
          chunk.code = chunk.code.replace(
            /from\s+["']\.\/(Vf[^/]+)\/[^"']+\.vue\.mjs["']/g,
            (_, name) => `from "./${name}/${defaultTier(name)}.mjs"`
          )
        }

        // Re-anchor component bindings outside the components' own modules.
        // Rollup traces re-exported bindings to their ORIGIN module — for
        // adapters that re-export core components that is the external core
        // module, which would let consumers' bundlers skip the local default
        // tier module (and with it the component's CSS imports). Point such
        // imports back at the local module so per-binding tree shaking keeps
        // exactly the used components' styles, and drop the theme-chunk
        // imports Rollup hoisted alongside them (the tier modules already
        // carry those).
        if (!/^components\/[^/]+\//.test(fileName)) {
          const chunkDir = posix.dirname(fileName)
          chunk.code = chunk.code.replace(
            /from\s*["']@vueform\/[\w-]+(?:\/vapor)?\/components\/(Vf[\w-]+)["']/g,
            (match, name) => {
              const localPath = `components/${name}/${defaultTier(name)}.mjs`
              if (!bundle[localPath]) return match
              let rel = posix.relative(chunkDir, localPath)
              if (!rel.startsWith('.')) rel = `./${rel}`
              return `from "${rel}"`
            }
          )
          chunk.code = chunk.code.replace(
            /^import\s*["'](@vueform\/[\w-]+\/[\w-]+\.css)["'];?[^\S\n]*\n/gm,
            (line, specifier) => (componentCss.has(specifier) ? '' : line)
          )
        }

        // Replace Rollup's `/* empty css */` markers with real import
        // statements pointing at the (possibly renamed) CSS asset.
        const importedCss = chunk.viteMetadata?.importedCss
        if (importedCss && importedCss.size > 0) {
          const chunkDir = posix.dirname(fileName)
          const importLines = Array.from(importedCss)
            .map((cssPath) => cssRenames.get(cssPath) ?? cssPath)
            .map((cssPath) => {
              let rel = posix.relative(chunkDir, cssPath)
              if (!rel.startsWith('.')) rel = `./${rel}`
              return `import "${rel}";`
            })
            .join('\n')

          if (/\/\*\s*empty css\s*\*\//.test(chunk.code)) {
            chunk.code = chunk.code.replace(
              /\/\*\s*empty css\s*\*\//,
              importLines
            )
          } else {
            chunk.code = `${importLines}\n${chunk.code}`
          }
        }

        chunk.code = chunk.code.replace(/\/\*\s*empty css\s*\*\//g, '')

        // Drop the `#shorthands` marker — types are injected into `.d.ts` only.
        if (options.shorthandProps) {
          chunk.code = stripShorthandMarkerFromCode(chunk.code)
        }
      }
    },

    // ------------------------------------------------------------------
    // closeBundle: optional post-build steps
    // ------------------------------------------------------------------
    closeBundle() {
      {
        // Dts emits the source spelling of the styles sidecars' side-effect
        // imports ('@/scss/x.scss'); rewrite to the published subpaths so the
        // shipped d.ts mirrors the runtime modules.
        let pkgName = ''
        try {
          pkgName = JSON.parse(
            readFileSync(resolve(root, 'package.json'), 'utf-8')
          ).name
        } catch {
          pkgName = ''
        }
        const componentsDir = resolve(root, outDir, 'components')
        if (pkgName && existsSync(componentsDir)) {
          for (const entry of readdirSync(componentsDir, {
            withFileTypes: true,
          })) {
            if (!entry.isDirectory()) continue
            const dts = resolve(componentsDir, entry.name, 'styles.d.ts')
            if (!existsSync(dts)) continue
            const content = readFileSync(dts, 'utf-8')
            const rewritten = content.replace(
              /(["'])@\/scss\/([\w-]+)\.scss(["'])/g,
              `$1${pkgName}/$2.css$3`
            )
            if (rewritten !== content) writeFileSync(dts, rewritten)
          }
        }
      }

      if (options.shorthandProps) {
        const { written, skipped } = injectShorthandPropsDts(
          resolve(root, outDir),
          options.shorthandProps
        )
        if (written > 0 || skipped.length > 0) {
          const skipNote =
            skipped.length > 0
              ? ` (skipped ${skipped.length}: ${skipped.slice(0, 3).join('; ')}${skipped.length > 3 ? '…' : ''})`
              : ''
          // Keep this quiet unless something was actually written — matches
          // the rest of vf-build's logLevel:'warn' defaults.
          if (written > 0) {
            // eslint-disable-next-line no-console
            console.info(
              `[vf-build] shorthand props: wrote ${written} shorthands.d.ts${skipNote}`
            )
          }
        }
      }

      if (options.themeScss) {
        const {
          srcDir,
          outDir: scssOutDir,
          cssOutDir,
          importMap = {},
        } = options.themeScss
        const absSrc = resolve(root, srcDir)
        // Resolves package-specifier @use/@forward in the sources (sass has
        // no node resolution of its own).
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
        // theme.scss is the aggregate recipe — flattened and copied by the
        // themeCss step, never compiled or copied as a chunk.
        const scssFiles = readdirSync(absSrc).filter(
          (f) => f.endsWith('.scss') && f !== 'theme.scss'
        )

        if (cssOutDir) {
          const absOut = resolve(root, cssOutDir)
          if (!existsSync(absOut)) mkdirSync(absOut, { recursive: true })
          const sass = loadSassCompiler()
          for (const file of scssFiles) {
            const name = basename(file, '.scss')
            const result = sass.compile(resolve(absSrc, file), {
              style: 'expanded',
              importers,
            })
            // Mixin-only partials (e.g. tabular-cell) compile to nothing but
            // their doc comments — their rules ship inside the chunks that
            // @use them.
            if (!result.css.replace(/\/\*[\s\S]*?\*\//g, '').trim()) continue
            writeCssWithShim(absOut, name, result.css)
          }
        }

        {
          const absScssOut = resolve(root, scssOutDir)
          if (!existsSync(absScssOut))
            mkdirSync(absScssOut, { recursive: true })
          for (const file of scssFiles) {
            copyFileSync(resolve(absSrc, file), resolve(absScssOut, file))
            writeFileSync(resolve(absScssOut, `${file}.mjs`), CSS_NODE_SHIM)
          }
        }
      }

      if (options.themeCss) {
        const {
          recipe,
          chunksDir = 'dist/css',
          resolve: resolveDirs = {},
          out = 'dist/css/theme.css',
          recipeOut,
        } = options.themeCss
        const absRecipe = resolve(root, recipe)
        const scss = readFileSync(absRecipe, 'utf-8')
        const refs = [
          ...scss.matchAll(/@use\s+["']([^"']*?)([\w-]+)\.s?css["']/g),
        ].map((m) => ({ prefix: m[1], name: m[2] }))
        if (refs.length === 0) {
          throw new Error(
            `vfBuild({ themeCss }): no @use '...<chunk>.scss|css' lines found in ${recipe}`
          )
        }
        const flattened = refs
          .map(({ prefix, name }) => {
            const dir =
              Object.entries(resolveDirs).find(([specifier]) =>
                prefix.startsWith(specifier)
              )?.[1] ?? chunksDir
            const cssPath = resolve(root, dir, `${name}.css`)
            if (!existsSync(cssPath)) {
              throw new Error(
                `vfBuild({ themeCss }): recipe references missing chunk: ${name}.css (looked in ${dir})`
              )
            }
            return readFileSync(cssPath, 'utf-8').trim()
          })
          .join('\n\n')
        const absOut = resolve(root, out)
        mkdirSync(dirname(absOut), { recursive: true })
        writeFileSync(absOut, `${flattened}\n`)
        // Node exports-condition shim, same as the per-chunk ones — entry
        // modules (e.g. primevue's full.ts) import theme.css by bare
        // specifier, which must stay inert in plain Node.
        writeFileSync(`${absOut}.mjs`, CSS_NODE_SHIM)
        if (recipeOut) {
          const absRecipeOut = resolve(root, recipeOut)
          mkdirSync(dirname(absRecipeOut), { recursive: true })
          copyFileSync(absRecipe, absRecipeOut)
          writeFileSync(`${absRecipeOut}.mjs`, CSS_NODE_SHIM)
        }
      }

      {
        // A component-name union with ZERO imports — nuxt module options (and
        // any other name-level tooling) can reference it without pulling the
        // barrel's d.ts, whose per-component augmentations would otherwise
        // register every element type program-wide.
        const componentsDir = resolve(root, outDir, 'components')
        if (existsSync(componentsDir)) {
          const names = readdirSync(componentsDir, { withFileTypes: true })
            .filter((e) => e.isDirectory() && e.name.startsWith('Vf'))
            .map((e) => `'${e.name}'`)
          if (names.length) {
            writeFileSync(
              resolve(componentsDir, 'names.d.ts'),
              '// AUTO-GENERATED by @vueform/vite/build — do not edit.\n' +
                `export type ComponentNames =\n  | ${names.join('\n  | ')}\n`
            )
          }
        }
      }

      if (options.emitDmts) {
        const dmtsPath = resolve(root, outDir, 'index.d.mts')
        writeFileSync(dmtsPath, `export * from './index.js'\n`)
      }

      if (options.themeStyles) {
        const {
          themes,
          defaultTheme: _defaultTheme,
          scssDir,
          flat,
        } = options.themeStyles
        const dist = resolve(root, outDir)
        const cssImportRe = /import\s*["']([^"']+\.css)["']/

        if (flat) {
          const oldCssPaths = new Set<string>()
          const themeMjsPaths = new Set<string>()
          const distIndexCss = resolve(dist, 'index.css')

          for (const name of themes) {
            const mjsPath = resolveFlatThemeMjs(dist, name)
            if (!mjsPath) continue
            themeMjsPaths.add(mjsPath)

            const code = readFileSync(mjsPath, 'utf-8')
            const match = code.match(cssImportRe)
            if (!match) continue

            const cssPath = resolve(dirname(mjsPath), match[1])
            oldCssPaths.add(cssPath)
            const cssContent = readFileSync(cssPath, 'utf-8')

            writeFileSync(distIndexCss, cssContent)
            copyFileSync(
              resolve(root, scssDir, 'index.scss'),
              resolve(dist, 'index.scss')
            )

            const scssPartials = resolve(root, scssDir, 'scss')
            if (existsSync(scssPartials)) {
              cpSync(scssPartials, resolve(dist, 'scss'), { recursive: true })
            }

            writeFileSync(
              mjsPath,
              code.replace(
                cssImportRe,
                `import "${relativeImport(mjsPath, distIndexCss)}"`
              )
            )

            if (cssPath !== distIndexCss) {
              rmSync(cssPath, { force: true })
            }
          }

          // Rewrite any other top-level entry files that reference the
          // same hashed CSS asset (e.g. plugin.mjs).
          for (const file of readdirSync(dist)) {
            if (!file.endsWith('.mjs')) continue
            const entryPath = resolve(dist, file)
            if (themeMjsPaths.has(entryPath)) continue
            const code = readFileSync(entryPath, 'utf-8')
            const match = code.match(cssImportRe)
            if (!match) continue
            const cssPath = resolve(dirname(entryPath), match[1])
            if (!oldCssPaths.has(cssPath)) continue
            writeFileSync(
              entryPath,
              code.replace(
                cssImportRe,
                `import "${relativeImport(entryPath, distIndexCss)}"`
              )
            )
          }
        } else {
          const themeCss = new Map<string, string>()
          for (const name of themes) {
            const mjsPath = resolve(dist, `themes/${name}/index.mjs`)
            const code = readFileSync(mjsPath, 'utf-8')
            const match = code.match(cssImportRe)
            if (!match) continue
            const cssPath = resolve(dist, 'themes', name, match[1])
            themeCss.set(name, readFileSync(cssPath, 'utf-8'))
          }

          for (const name of themes) {
            const source = themeCss.get(name)
            if (!source) continue
            const themeDir = resolve(dist, `themes/${name}`)
            writeFileSync(resolve(themeDir, 'index.css'), source)
            copyFileSync(
              resolve(root, scssDir, name, 'index.scss'),
              resolve(themeDir, 'index.scss')
            )
          }

          for (const name of themes) {
            const mjsPath = resolve(dist, `themes/${name}/index.mjs`)
            const code = readFileSync(mjsPath, 'utf-8')
            writeFileSync(
              mjsPath,
              code.replace(cssImportRe, `import "./index.css"`)
            )
          }

          // Rewrite top-level entry points (e.g. origin.mjs, material.mjs)
          // that also reference the hashed CSS asset.
          for (const name of themes) {
            const entryPath = resolve(dist, `${name}.mjs`)
            if (!existsSync(entryPath)) continue
            const code = readFileSync(entryPath, 'utf-8')
            const match = code.match(cssImportRe)
            if (!match) continue
            writeFileSync(
              entryPath,
              code.replace(cssImportRe, `import "./themes/${name}/index.css"`)
            )
          }

          const assetsThemes = resolve(dist, 'assets/themes')
          rmSync(assetsThemes, { recursive: true, force: true })
          try {
            const remaining = readdirSync(resolve(dist, 'assets'))
            if (remaining.length === 0)
              rmSync(resolve(dist, 'assets'), { recursive: true })
          } catch {}
        }
      }
    },
  }

  return [scssExternals(), main]
}
