import * as fs from 'node:fs'
import * as path from 'node:path'

import { adapters } from './adapters'
import { generatedDir } from './paths'
import type { ScrapeScope } from './scope'

/**
 * Files whose adapter scrape is already a complete, curated set (own entries
 * plus core fallbacks, minus core entries the adapter renames away). Merging
 * core back in would resurrect renamed-away entries (e.g. primevue has
 * input-text instead of text), so the adapter file replaces core wholesale.
 */
const ADAPTER_REPLACES_CORE = new Set(['blueprints', 'components'])

/**
 * Every scraped file (scraper name = file basename).
 */
export const FILES = [
  'blueprints',
  'classes',
  'components',
  'composables',
  'contexts',
  'features',
  'helpers',
  'locales',
  'modules',
  'tokens',
] as const

/**
 * Alphabetic root key order; arrays are sorted when their values are strings.
 */
function sortRoot(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.every((v) => typeof v === 'string') ? [...value].sort() : value
  }
  if (value && typeof value === 'object') {
    const source = value as Record<string, unknown>
    const sorted: Record<string, unknown> = {}
    for (const key of Object.keys(source).sort()) {
      sorted[key] = source[key]
    }
    return sorted
  }
  return value
}

/**
 * Files whose entries are recursive member nodes and get `type` normalization.
 * The other files have no object-typed `type` (and contain maps whose keys may
 * legitimately be called `type`, e.g. the `type` prop).
 */
const MEMBER_NODE_FILES = new Set(['composables', 'features', 'helpers'])

/**
 * Normalizes a member node so `type` is always a string: a node whose scraped
 * `type` is a member map becomes `type: 'object'` with the map under `members`
 * (in place, right after `type`, to keep key order stable). The walk is
 * structure-aware — only known node fields recurse, so maps with an entry named
 * `type` (the `type` prop, a `type` param) are never rewritten.
 */
const MEMBER_MAP_FIELDS = new Set([
  'params',
  'members',
  'props',
  'deps',
  'events',
])

function normalizeMemberMap(
  map: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [name, node] of Object.entries(map)) {
    out[name] = normalizeMemberNode(node)
  }
  return out
}

function normalizeMemberNode(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value

  const node = value as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(node)) {
    if (
      key === 'type' &&
      child &&
      typeof child === 'object' &&
      !Array.isArray(child)
    ) {
      out.type = 'object'
      out.members = normalizeMemberMap(child as Record<string, unknown>)
    } else if (
      MEMBER_MAP_FIELDS.has(key) &&
      child &&
      typeof child === 'object' &&
      !Array.isArray(child)
    ) {
      out[key] = normalizeMemberMap(child as Record<string, unknown>)
    } else if (key === 'returns') {
      out[key] = normalizeMemberNode(child)
    } else if (key === 'overloads' && Array.isArray(child)) {
      out[key] = child.map(normalizeMemberNode)
    } else {
      out[key] = child
    }
  }
  return out
}

/**
 * A feature entry's map-valued fields: every one holds member nodes directly
 * (returns/config included — unlike helpers/composables, where `returns` is
 * itself a node).
 */
const FEATURE_ENTRY_MAP_FIELDS = new Set([
  'props',
  'deps',
  'events',
  'config',
  'returns',
])

function normalizeFeatureEntry(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value

  const entry = value as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(entry)) {
    if (
      FEATURE_ENTRY_MAP_FIELDS.has(key) &&
      child &&
      typeof child === 'object' &&
      !Array.isArray(child)
    ) {
      out[key] = normalizeMemberMap(child as Record<string, unknown>)
    } else {
      out[key] = child
    }
  }
  return out
}

function normalizeTypes(name: string, value: unknown): unknown {
  if (!MEMBER_NODE_FILES.has(name)) return value
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value

  if (name === 'features') {
    const out: Record<string, unknown> = {}
    for (const [entryName, entry] of Object.entries(
      value as Record<string, unknown>
    )) {
      out[entryName] = normalizeFeatureEntry(entry)
    }
    return out
  }

  return normalizeMemberMap(value as Record<string, unknown>)
}

/**
 * Removes TS symbol-named members (`__@brandKey@123`) — internal branding
 * properties that never belong in the published lists.
 */
function stripSymbolKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripSymbolKeys)
  if (!value || typeof value !== 'object') return value
  const out: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(value)) {
    if (key.startsWith('__@')) continue
    out[key] = stripSymbolKeys(child)
  }
  return out
}

function readJson(file: string): unknown {
  return fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, 'utf-8'))
    : undefined
}

function writeJson(file: string, data: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
}

/**
 * Assembles the final `core/` and per-adapter (`ui/`, `primevue/`, …) trees
 * from the scrapers' raw output (core-level files plus `_<adapter>` deltas),
 * then removes the raw files. Only the folders in scope are written; an
 * adapter-scoped run without core in scope merges against the EXISTING `core/`
 * files instead of fresh raw output. Every folder holds every file: an adapter
 * file is core merged with the adapter's own entries — the adapter wins on
 * conflicts — and every file gets alphabetic root key order.
 */
export function assemble(names: readonly string[], scope: ScrapeScope): void {
  const assembled: string[] = []

  for (const name of names) {
    const file = `${name}.json`

    let rawCore: unknown
    if (scope.core) {
      // blueprints/components scrape their core data under _ui, the rest at
      // the top level — either way it comes from packages/core.
      const raw =
        readJson(path.join(generatedDir, file)) ??
        readJson(path.join(generatedDir, '_ui', file))
      if (raw === undefined) continue
      rawCore = normalizeTypes(name, stripSymbolKeys(raw))
      writeJson(path.join(generatedDir, 'core', file), sortRoot(rawCore))
    } else {
      // Already normalized and sorted when it was assembled.
      rawCore = readJson(path.join(generatedDir, 'core', file))
      if (rawCore === undefined) {
        console.warn(
          `[assemble] no core/${file} to merge against — run \`pnpm api\` first`
        )
        continue
      }
    }

    for (const adapterName of scope.adapters) {
      const rawAdapterFile = readJson(
        path.join(generatedDir, `_${adapterName}`, file)
      )
      const rawAdapter =
        rawAdapterFile === undefined
          ? undefined
          : normalizeTypes(name, stripSymbolKeys(rawAdapterFile))
      const merged =
        rawAdapter === undefined ||
        Array.isArray(rawCore) ||
        Array.isArray(rawAdapter) ||
        typeof rawAdapter !== 'object'
          ? (rawAdapter ?? rawCore)
          : ADAPTER_REPLACES_CORE.has(name)
            ? rawAdapter
            : { ...(rawCore as object), ...(rawAdapter as object) }
      writeJson(path.join(generatedDir, adapterName, file), sortRoot(merged))
    }

    assembled.push(name)
  }

  // Drop the raw files — only core/ and the adapter folders remain.
  for (const name of FILES) {
    const raw = path.join(generatedDir, `${name}.json`)
    if (fs.existsSync(raw)) fs.rmSync(raw)
  }
  for (const adapterName of Object.keys(adapters)) {
    const rawDir = path.join(generatedDir, `_${adapterName}`)
    if (fs.existsSync(rawDir)) fs.rmSync(rawDir, { recursive: true })
  }

  const targets = [...(scope.core ? ['core'] : []), ...scope.adapters]

  console.log(`[assemble] ${targets.join(' + ')}: ${assembled.join(', ')}`)
}
