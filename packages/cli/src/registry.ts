import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

// Manually maintained component descriptions, keyed by adapter short name
// (@vueform/ui → "ui"). Registries only carry generated placeholder
// descriptions, so this is the source of truth for what's shown to users.
// tsc emits the imported file into dist/, so it ships with the build.
import descriptions from './components.json' with { type: 'json' }
import { detectAdapter, findPackageDir } from './project.js'
import type {
  Registry,
  RegistryError,
  RegistryIndexEntry,
  RegistryItem,
} from './types.js'

// The registry format version this CLI understands. Bump together with the
// schemas in @vueform/core/schemas when the format changes.
export const REGISTRY_SCHEMA_VERSION = 1

function readJson(filePath: string) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch {
    return null
  }
}

/**
 * The curated descriptions for one adapter's components; empty when the adapter
 * is unknown.
 */
export function componentDescriptions(pkg: string): Record<string, string> {
  const byAdapter: Record<string, Record<string, string>> = descriptions

  return byAdapter[pkg.replace(/^@vueform\//, '')] ?? {}
}

/**
 * Locates the installed Vueform adapter's registry (<package>/registry). Only
 * adapters ship registries — @vueform/core is a dependency of adapters, not a
 * supported direct source of copies. Returns `{ package, dir, index }` or `{
 * error, package? }` with error one of 'no-package' | 'no-registry' |
 * 'invalid'
 *
 * | 'version'.
 */
export function loadRegistry(cwd: string): Registry | RegistryError {
  const name = detectAdapter(cwd)

  if (!name) return { error: 'no-package' }

  const pkgDir = findPackageDir(name, cwd)

  if (!pkgDir) return { error: 'no-package' }

  const dir = path.join(pkgDir, 'registry')
  const indexPath = path.join(dir, 'index.json')

  if (!existsSync(indexPath)) return { error: 'no-registry', package: name }

  const index = readJson(indexPath)

  if (!index || !Array.isArray(index.items)) {
    return { error: 'invalid', package: name }
  }

  if (index.schemaVersion !== REGISTRY_SCHEMA_VERSION) {
    return { error: 'version', package: name, found: index.schemaVersion }
  }

  // Overlay the curated descriptions everywhere the index flows (list,
  // pickers); components the file doesn't know keep the registry's own.
  const descriptions = componentDescriptions(name)

  index.items = index.items.map((item: RegistryIndexEntry) => ({
    ...item,
    description: descriptions[item.name] ?? item.description,
  }))

  return { package: name, dir, index }
}

/**
 * Loads one item manifest from a loaded registry. The name is canonicalized
 * against the index (exact match first, then case-insensitive) so lookups
 * behave the same on case-insensitive filesystems and provenance is recorded
 * under the canonical name. Returns the manifest or null.
 */
export function loadItem(
  registry: Registry,
  name: string
): RegistryItem | null {
  const names = registry.index.items.map((item) => item.name)
  const canonical =
    names.find((candidate) => candidate === name) ??
    names.find((candidate) => candidate.toLowerCase() === name.toLowerCase())

  if (!canonical) return null

  const item = readJson(path.join(registry.dir, 'schemas', `${canonical}.json`))

  if (!item || item.schemaVersion !== REGISTRY_SCHEMA_VERSION) return null

  return item
}

/**
 * Near-matches for an unknown component name (case-insensitive, substring).
 */
export function suggestItems(registry: Registry, name: string) {
  const query = name.toLowerCase()

  return registry.index.items
    .map((item) => item.name)
    .filter((candidate) => {
      const lower = candidate.toLowerCase()

      if (lower.includes(query) || query.includes(lower)) return true

      // Shared prefix of 3+ characters catches near-misses like VfTx.
      let prefix = 0
      while (
        prefix < lower.length &&
        prefix < query.length &&
        lower[prefix] === query[prefix]
      ) {
        prefix++
      }
      return prefix >= 3
    })
}

/**
 * The npm package a bare import specifier belongs to.
 */
export function packageOf(specifier: string) {
  const segments = specifier.split('/')
  return specifier.startsWith('@')
    ? segments.slice(0, 2).join('/')
    : segments[0]
}

/**
 * Returns the import specifiers of an item whose packages don't resolve from
 * `cwd`.
 */
export function missingImports(item: RegistryItem, cwd: string) {
  const packages = [...new Set((item.imports ?? []).map(packageOf))]
  return packages.filter((name) => !findPackageDir(name, cwd))
}
