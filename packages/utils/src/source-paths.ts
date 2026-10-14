/**
 * TypeScript `paths` mappings derived from the workspace packages' `exports`
 * maps — the tsconfig twin of `sourceAliases.ts`, sharing its philosophy: the
 * published entry points are the single source of truth, and the mirror build
 * makes the mapping mechanical (`./dist/x.js` ↔ `src/x.ts`).
 *
 * The playground generator (`pg:up`) injects these into a copied playground's
 * tsconfig so its type-check resolves published specifiers to sources. The
 * templates themselves ship without any mappings and type-check against the
 * installed packages, which keeps them usable standalone (e.g. StackBlitz).
 *
 * Unlike the runtime aliases, vapor playgrounds get a `/vapor` twin for every
 * entry (`@vueform/ui/vapor/origin` → `src/origin.ts`): the vapor/vdom split
 * only exists in the built dist, and tsconfig patterns cannot express the
 * strip-and-re-resolve the dev plugin does at runtime.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { basename, join, relative } from 'node:path'

interface PackageManifest {
  name?: string
  exports?: Record<string, unknown>
  vueform?: { group?: string }
}

export interface SourcePathsOptions {
  /**
   * The playground's adapter (package dir name). Other adapters' packages are
   * left out of the mappings.
   */
  adapter?: string
  /**
   * Also emit the `/vapor` twin for every entry — only vapor playgrounds import
   * the `/vapor` subpaths.
   */
  vapor?: boolean
}

/**
 * Only these packages take part in a playground's type-check: core, the
 * playground's own adapter, and the plugins. Other adapters and tooling
 * packages (like this one) resolve through their installed dists.
 */
function isPlaygroundPackage(
  dir: string,
  manifest: PackageManifest,
  options: SourcePathsOptions
): boolean {
  const name = basename(dir)
  if (name === 'core') return true
  const group = manifest.vueform?.group
  if (group === 'adapter' || group === 'adapters') {
    return !options.adapter || name === options.adapter
  }
  return group === 'plugin' || group === 'plugins'
}

function readManifest(dir: string): PackageManifest | undefined {
  try {
    return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'))
  } catch {
    return undefined
  }
}

/**
 * The `#<dir>` internal specifiers, mirroring the root tsconfig's shape: the
 * bare entry for every package, plus a `/*` catch-all for core and the adapter
 * (plugins are only ever imported bare).
 */
function hashPaths(dir: string, relativeTo: string): Record<string, string[]> {
  const srcAbs = join(dir, 'src')
  const rel = (abs: string) => relative(relativeTo, abs)
  const name = basename(dir)
  const group = readManifest(dir)?.vueform?.group

  const paths: Record<string, string[]> = {
    [`#${name}`]: [rel(join(srcAbs, 'index.ts'))],
  }
  if (group !== 'plugin' && group !== 'plugins') {
    paths[`#${name}/*`] = [`${rel(srcAbs)}/*`]
  }
  return paths
}

/**
 * The full package name's exports-derived surface, mirroring what consumers can
 * actually import — plus, for vapor playgrounds, the `/vapor` twin of every
 * entry.
 */
function packagePaths(
  dir: string,
  relativeTo: string,
  options: SourcePathsOptions
): Record<string, string[]> {
  const manifest = readManifest(dir)!
  const srcAbs = join(dir, 'src')
  const rel = (abs: string) => relative(relativeTo, abs)
  const prefix = manifest.name ?? `#${basename(dir)}`

  const paths: Record<string, string[]> = {}
  const add = (subpath: string, targets: string[]) => {
    paths[`${prefix}${subpath}`] = targets
    if (options.vapor) paths[`${prefix}/vapor${subpath}`] = targets
  }

  add('', [rel(join(srcAbs, 'index.ts'))])

  for (const [key, value] of Object.entries(manifest.exports ?? {})) {
    if (
      key === '.' ||
      key === './vapor' ||
      key.startsWith('./vapor/') ||
      key.startsWith('./*.')
    ) {
      continue
    }

    // TS path patterns allow at most one `*` per pattern.
    if ((key.match(/\*/g) ?? []).length > 1) continue

    const conditions = value as Record<string, string> | null
    const target = conditions?.import ?? conditions?.default
    if (
      typeof target !== 'string' ||
      !target.startsWith('./dist/') ||
      !/\.(mjs|js)$/.test(target)
    ) {
      continue
    }

    const replacement = target
      .replace('./dist/', `${srcAbs}/`)
      .replace(/\.(mjs|js)$/, '.ts')

    // Not yet following the mirror-dist shape — leave it to the catch-all.
    if (!key.includes('*') && !existsSync(replacement)) continue

    const targets = [rel(replacement)]
    if (key.includes('*')) {
      // A TS `*` spans path separators and the longest-prefix pattern wins
      // with no fallback across patterns, so `…/components/*` would shadow
      // deeper imports like `…/components/VfCheckbox/types`. A second
      // substitution restores them: substitutions ARE tried in order.
      const fallback = `${rel(srcAbs)}/${key.slice(2)}`
      if (!targets.includes(fallback)) targets.push(fallback)
    }

    add(`/${key.slice(2)}`, targets)
  }

  add('/*', [`${rel(srcAbs)}/*`])

  return paths
}

/**
 * `paths` for every package in a `packages/` directory, with targets relative
 * to `relativeTo` (the directory of the tsconfig they will be written into).
 * Entries are ordered: all `#` specifiers first (core, then the adapter, then
 * the plugins), followed by the `@vueform/*` blocks in the same package order.
 */
export function workspaceSourcePaths(
  packagesDir: string,
  relativeTo: string,
  options: SourcePathsOptions = {}
): Record<string, string[]> {
  const rank = (dir: string) => {
    if (basename(dir) === 'core') return 0
    const group = readManifest(dir)?.vueform?.group
    return group === 'adapter' || group === 'adapters' ? 1 : 2
  }

  const dirs = readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(packagesDir, entry.name))
    .filter((dir) => {
      const manifest = readManifest(dir)
      return (
        !!manifest &&
        existsSync(join(dir, 'src', 'index.ts')) &&
        isPlaygroundPackage(dir, manifest, options)
      )
    })
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))

  const paths: Record<string, string[]> = {}
  for (const dir of dirs) {
    Object.assign(paths, hashPaths(dir, relativeTo))
  }
  for (const dir of dirs) {
    Object.assign(paths, packagePaths(dir, relativeTo, options))
  }

  return paths
}
