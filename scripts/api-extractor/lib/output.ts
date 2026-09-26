import * as fs from 'node:fs'
import * as path from 'node:path'

import { adapters, corePackage } from './adapters'
import { mergeIssues, type Issue } from './issues'
import { generatedDir, monorepoRoot } from './paths'
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

const CLASS_ISSUE_PREFIX = 'classes.'

/**
 * Files searched for a missing class's source location: the component that
 * renders it, then the VfLayout that contributes the base classes.
 */
function classLiteralCandidates(
  target: string,
  componentName: string
): string[] {
  const pkg = adapters[target]?.path ?? corePackage
  const dirs = pkg === corePackage ? [pkg] : [pkg, corePackage]
  return dirs.flatMap((dir) => [
    path.join(
      monorepoRoot,
      dir,
      'src/components',
      componentName,
      `${componentName}.vue`
    ),
    path.join(monorepoRoot, dir, 'src/components/VfLayout/VfLayout.vue'),
  ])
}

function locateClassLiteral(
  target: string,
  componentName: string,
  cls: string
): { file?: string; line?: number } {
  const pattern = new RegExp(`['"\`]${cls}['"\`]`)
  for (const candidate of classLiteralCandidates(target, componentName)) {
    if (!fs.existsSync(candidate)) continue
    const lines = fs.readFileSync(candidate, 'utf-8').split('\n')
    const idx = lines.findIndex((l) => pattern.test(l))
    if (idx !== -1) {
      return { file: path.relative(monorepoRoot, candidate), line: idx + 1 }
    }
  }
  return {}
}

/**
 * Records a `missing` issue for every vf-* class a component default renders
 * that has no documented entry (root or modifier) in the source's classes.json
 * — those show up in the docs without a description popover.
 */
function collectClassIssues(target: string): Issue[] {
  const classesData = readJson(path.join(generatedDir, target, 'classes.json'))
  const componentsData = readJson(
    path.join(generatedDir, target, 'components.json')
  )
  if (
    !classesData ||
    !componentsData ||
    typeof classesData !== 'object' ||
    typeof componentsData !== 'object'
  ) {
    return []
  }

  const documented = new Set(Object.keys(classesData))
  for (const entry of Object.values(
    classesData as Record<string, { modifiers?: Record<string, unknown> }>
  )) {
    for (const modifier of Object.keys(entry.modifiers ?? {})) {
      documented.add(modifier)
    }
  }

  const issues = new Map<string, Issue>()
  for (const [componentName, entry] of Object.entries(
    componentsData as Record<
      string,
      { classes?: Record<string, { default?: string }> }
    >
  )) {
    for (const info of Object.values(entry.classes ?? {})) {
      for (const raw of (info.default ?? '').split(/\s+/)) {
        const cls = raw.replace(/\?$/, '')
        if (!cls.startsWith('vf-') || documented.has(cls)) continue
        if (issues.has(cls)) continue
        issues.set(cls, {
          name: `${CLASS_ISSUE_PREFIX}${cls}`,
          reason: 'missing',
          ...locateClassLiteral(target, componentName, cls),
        })
      }
    }
  }

  const memberIssues: Issue[] = []
  const walkMembers = (
    node: unknown,
    namePath: string,
    componentName: string,
    partName: string
  ) => {
    if (!node || typeof node !== 'object' || Array.isArray(node)) return
    const record = node as {
      description?: unknown
      type?: unknown
      params?: Record<string, unknown>
    }
    if (!record.description) {
      memberIssues.push({
        name: namePath,
        reason: 'missing',
        ...locateInterfaceMember(target, componentName, 'Classes', partName),
      })
    }
    for (const [paramName, param] of Object.entries(record.params ?? {})) {
      walkMembers(param, `${namePath}.${paramName}`, componentName, partName)
    }
    if (record.type && typeof record.type === 'object') {
      for (const [memberName, member] of Object.entries(
        record.type as Record<string, unknown>
      )) {
        walkMembers(
          member,
          `${namePath}.${memberName}`,
          componentName,
          partName
        )
      }
    }
  }

  for (const [componentName, entry] of Object.entries(
    componentsData as Record<string, { classes?: Record<string, unknown> }>
  )) {
    for (const [partName, info] of Object.entries(entry.classes ?? {})) {
      walkMembers(
        info,
        `${CLASS_ISSUE_PREFIX}${componentName}.${partName}`,
        componentName,
        partName
      )
    }
  }

  return [...issues.values(), ...memberIssues]
}

const SLOT_ISSUE_PREFIX = 'slots.'

/**
 * Locates a member inside a `<Component><suffix>` interface (Slots, Classes, …)
 * of a types.ts, searching the adapter package first, then core.
 */
function locateInterfaceMember(
  target: string,
  componentName: string,
  suffix: string,
  member: string
): { file?: string; line?: number } {
  const pkg = adapters[target]?.path ?? corePackage
  const dirs = pkg === corePackage ? [pkg] : [pkg, corePackage]
  const memberPattern = new RegExp(`^\\s*(['"]?)${member}\\1\\??:`)

  for (const dir of dirs) {
    const candidate = path.join(
      monorepoRoot,
      dir,
      'src/components',
      componentName,
      'types.ts'
    )
    if (!fs.existsSync(candidate)) continue
    const lines = fs.readFileSync(candidate, 'utf-8').split('\n')
    const start = lines.findIndex((l) =>
      l.includes(`interface ${componentName}${suffix}`)
    )
    if (start === -1) continue
    for (let i = start + 1; i < lines.length; i++) {
      if (/^(export )?(interface|type) /.test(lines[i])) break
      if (memberPattern.test(lines[i])) {
        return { file: path.relative(monorepoRoot, candidate), line: i + 1 }
      }
    }
  }
  return {}
}

/**
 * Records a `missing` issue for every slot and slot param in components.json
 * without a description.
 */
function collectSlotIssues(target: string): Issue[] {
  const componentsData = readJson(
    path.join(generatedDir, target, 'components.json')
  )
  if (!componentsData || typeof componentsData !== 'object') return []

  const issues: Issue[] = []
  for (const [componentName, entry] of Object.entries(
    componentsData as Record<
      string,
      {
        slots?: Record<
          string,
          { description?: string; params?: Record<string, unknown> }
        >
      }
    >
  )) {
    for (const [slotName, slot] of Object.entries(entry.slots ?? {})) {
      if (!slot.description) {
        issues.push({
          name: `${SLOT_ISSUE_PREFIX}${componentName}.${slotName}`,
          reason: 'missing',
          ...locateInterfaceMember(target, componentName, 'Slots', slotName),
        })
      }
      for (const [paramName, param] of Object.entries(slot.params ?? {})) {
        const description =
          param && typeof param === 'object'
            ? (param as { description?: string }).description
            : undefined
        if (!description) {
          issues.push({
            name: `${SLOT_ISSUE_PREFIX}${componentName}.${slotName}.${paramName}`,
            reason: 'missing',
            ...locateInterfaceMember(target, componentName, 'Slots', slotName),
          })
        }
      }
    }
  }
  return issues
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
          `[assemble] no core/${file} to merge against — run \`pnpm extract --core ${name}\` first`
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

  // Classes that render in the docs need a documented description; refresh the
  // report only when this run rebuilt both sides of the cross-check.
  if (assembled.includes('classes') && assembled.includes('components')) {
    for (const target of targets) {
      mergeIssues(target, CLASS_ISSUE_PREFIX, collectClassIssues(target))
    }
  }
  if (assembled.includes('components')) {
    for (const target of targets) {
      mergeIssues(target, SLOT_ISSUE_PREFIX, collectSlotIssues(target))
    }
  }

  console.log(`[assemble] ${targets.join(' + ')}: ${assembled.join(', ')}`)
}
