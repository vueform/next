/**
 * Source aliases derived from the workspace packages' `exports` maps, so dev
 * servers and tests resolve published specifiers (`@vueform/core/locales`,
 * `#ui/components/VfText`, …) to their source equivalents instead of dist. The
 * mirror build makes the mapping mechanical (`./dist/x.mjs` ↔ `src/x.ts`), so
 * the exports map stays the single source of truth: a package that changes an
 * entry (say, its default component tier) changes what these aliases serve.
 *
 * Self-contained on purpose (node builtins + vite types only): the playground
 * dev plugin imports this module by path and gets bundled into standalone
 * playground configs, where none of this package's dependencies are installed.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { basename, join } from 'node:path'
import type { Alias } from 'vite'

interface PackageManifest {
  name?: string
  exports?: Record<string, unknown>
}

export interface SourceAliasOptions {
  /**
   * Also derive style aliases from the `./*.css` / `./*.scss` export patterns
   * (`<prefix>/x.css` → `src/scss/x.scss`) — for dev servers that compile
   * stylesheets from source. Tests have no use for them.
   */
  styles?: boolean
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function readManifest(dir: string): PackageManifest | undefined {
  try {
    return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'))
  } catch {
    return undefined
  }
}

/**
 * Aliases derived from one package's `exports` map under one specifier prefix.
 *
 * Skipped: `.` (the package-level alias covers it), `vapor` subpaths (vapor
 * dist has no vdom source equivalent; dev strips the segment, tests don't use
 * them), style patterns unless `styles` is set, and — since packages are still
 * work in progress — any static entry whose mirrored source file doesn't exist
 * yet, which falls through to the package's `/*` catch-all.
 */
function exportsAliases(
  short: string,
  srcAbs: string,
  exportsMap: Record<string, unknown> | undefined,
  options: SourceAliasOptions
): Alias[] {
  if (!exportsMap) return []

  return Object.entries(exportsMap).flatMap(([key, value]) => {
    if (key === '.' || key.startsWith('./vapor/') || key === './vapor') {
      return []
    }

    // Style patterns: the built stylesheets compile from `src/scss/<name>.scss`.
    if (key === './*.css' || key === './*.scss') {
      if (!options.styles || !existsSync(join(srcAbs, 'scss'))) return []
      const ext = key.slice(4)
      return [
        {
          find: new RegExp(`^${escapeRegExp(short)}/([\\w-]+)\\.${ext}$`),
          replacement: `${join(srcAbs, 'scss')}/$1.scss`,
        },
      ]
    }
    if (key.startsWith('./*.')) return []

    const target = (value as Record<string, string> | null)?.import
    if (
      typeof target !== 'string' ||
      !target.startsWith('./dist/') ||
      !target.endsWith('.mjs')
    ) {
      return []
    }

    let group = 0
    const replacement = target
      .replace('./dist/', `${srcAbs}/`)
      .replace(/\.mjs$/, '.ts')
      .replace(/\*/g, () => `$${++group}`)

    // Not yet following the mirror-dist shape — leave it to the catch-all.
    if (!group && !existsSync(replacement)) return []

    // A `*` matches a single path segment (like the export patterns in
    // practice); deeper paths fall through to the catch-all.
    const find = new RegExp(
      `^${escapeRegExp(short)}/${key
        .slice(2)
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '([^/]+)')}$`
    )
    return [{ find, replacement }]
  })
}

/**
 * Source aliases for one workspace package (core, an adapter, or a plugin),
 * under its short alias derived from the directory name (`core` → `#core`) and
 * its full package name: the bare alias to the source index, the
 * exports-derived subpaths, and a `/*` catch-all into `src`.
 */
export function packageSourceAliases(
  dir: string,
  options: SourceAliasOptions = {}
): Alias[] {
  const manifest = readManifest(dir)
  const srcAbs = join(dir, 'src')
  if (!manifest || !existsSync(join(srcAbs, 'index.ts'))) return []

  // Both the short alias and the full package name get the same treatment,
  // so the real runtime specifiers (`@vueform/core/locales`, …) also resolve
  // to sources — mixing source and dist module instances would duplicate
  // registries and injection keys.
  const prefixes = [`#${basename(dir)}`]
  if (manifest.name && !prefixes.includes(manifest.name)) {
    prefixes.push(manifest.name)
  }

  return prefixes.flatMap((prefix) => [
    {
      find: new RegExp(`^${escapeRegExp(prefix)}$`),
      replacement: join(srcAbs, 'index.ts'),
    },
    ...exportsAliases(prefix, srcAbs, manifest.exports, options),
    {
      // `vapor` subpaths have no source directory of their own and must stay
      // resolvable by consumers (the playground dev plugin strips the segment
      // in resolveId, which aliases would otherwise preempt).
      find: new RegExp(`^${escapeRegExp(prefix)}/(?!vapor(?:/|$))(.+)$`),
      replacement: `${srcAbs}/$1`,
    },
  ])
}

/**
 * Source aliases for every package in a `packages/` directory.
 */
export function workspaceSourceAliases(
  packagesDir: string,
  options: SourceAliasOptions = {}
): Alias[] {
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) =>
      packageSourceAliases(join(packagesDir, entry.name), options)
    )
}
