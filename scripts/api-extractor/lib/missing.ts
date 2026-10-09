/**
 * Missing-description report over the assembled `.vueform/api/` trees —
 * missing means a `description` key holding an empty string. Nodes without
 * the key don't count (blueprint entries carry only a `loc` by design), and
 * `{ from: … }` references inherit their origin's docs and are skipped. The
 * report lands in `.vueform/api/missing.json` for the future validator /
 * doc-writing agent. Shared by the `pnpm api` runner (which reports after a
 * successful extraction) and `pnpm api:missing` (which only regenerates the
 * report, optionally filtered by the `@write` flag).
 */
import * as fs from 'node:fs'
import * as path from 'node:path'

import { generatedDir, monorepoRoot } from './paths'

export interface MissingItem {
  path: string
  /**
   * Whether the declaration's docblock carries `@write` — deliberately
   * writable and left undescribed.
   */
  flagged: boolean
  loc?: string
}

export interface MissingReport {
  total: number
  /**
   * Distinct `loc` values — core/ui/primevue repeat the same sources, so
   * this is the number of places a description actually has to be written.
   */
  locations: number
  targets: Record<string, Record<string, MissingItem[]>>
}

/**
 * Restricts the report to `@write`-flagged entries or to unflagged ones;
 * without it everything is included.
 */
export type MissingFilter = 'flagged' | 'unflagged'

export interface MissingOptions {
  filter?: MissingFilter
  /**
   * List each `loc` only once — the first occurrence wins (targets are
   * walked alphabetically, so that is core's).
   */
  unique?: boolean
}

export function collectMissingDescriptions({
  filter,
  unique,
}: MissingOptions = {}): MissingReport {
  const report: MissingReport = { total: 0, locations: 0, targets: {} }
  const locations = new Set<string>()

  // Cached source lines for the @write docblock check.
  const sourceLines = new Map<string, string[]>()
  const hasWriteTag = (rawLoc: string): boolean => {
    const splitAt = rawLoc.lastIndexOf(':')
    const rel = rawLoc.slice(0, splitAt)
    const line = Number(rawLoc.slice(splitAt + 1))
    let lines = sourceLines.get(rel)
    if (!lines) {
      try {
        lines = fs
          .readFileSync(path.resolve(monorepoRoot, rel), 'utf8')
          .split('\n')
      } catch {
        lines = []
      }
      sourceLines.set(rel, lines)
    }
    // The loc line is the declaration itself (leading trivia skipped), so its
    // docblock ends right above — scan that contiguous block upward.
    let i = line - 2
    if (i < 0 || !lines[i]?.trim().endsWith('*/')) return false
    for (; i >= 0; i--) {
      const text = lines[i].trim()
      if (text.includes('@write')) return true
      if (text.startsWith('/*')) break
    }
    return false
  }

  const walk = (
    node: unknown,
    jsonPath: string,
    items: MissingItem[],
    excludeCoreLocs: boolean
  ) => {
    if (Array.isArray(node)) {
      node.forEach((child, i) =>
        walk(child, `${jsonPath}[${i}]`, items, excludeCoreLocs)
      )
      return
    }
    if (!node || typeof node !== 'object') return
    const record = node as Record<string, unknown>

    const isFromRef = typeof record.from === 'string'
    // Adapter trees merge core's entries in — a node whose loc points into
    // core is already listed under the core target, so adapter targets only
    // list their own sources.
    const inheritedFromCore =
      excludeCoreLocs &&
      typeof record.loc === 'string' &&
      record.loc.startsWith('packages/core/')
    const missing =
      !isFromRef &&
      !inheritedFromCore &&
      typeof record.description === 'string' &&
      record.description.trim() === ''

    if (missing) {
      const item: MissingItem = { path: jsonPath, flagged: false }
      if (typeof record.loc === 'string') {
        item.flagged = hasWriteTag(record.loc)
      }
      const included =
        !filter || (filter === 'flagged') === item.flagged // both directions
      const duplicate =
        unique === true &&
        typeof record.loc === 'string' &&
        locations.has(record.loc)
      if (included && !duplicate) {
        report.total++
        if (typeof record.loc === 'string') {
          // As a `file://<abs>#L<line>` URL the loc is clickable right in
          // the editor view of missing.json (the editor's link detector only
          // recognizes http/https/file schemes; the #L fragment carries the
          // line).
          const splitAt = record.loc.lastIndexOf(':')
          const relPath = record.loc.slice(0, splitAt)
          const line = record.loc.slice(splitAt + 1)
          item.loc = `file://${path.resolve(monorepoRoot, relPath)}#L${line}`
          locations.add(record.loc)
        }
        items.push(item)
      }
    }

    for (const [key, child] of Object.entries(record)) {
      walk(child, jsonPath ? `${jsonPath}.${key}` : key, items, excludeCoreLocs)
    }
  }

  for (const target of fs.readdirSync(generatedDir)) {
    if (target === 'logs') continue
    if (!fs.statSync(path.join(generatedDir, target)).isDirectory()) continue
    const files: Record<string, MissingItem[]> = {}
    for (const file of fs.readdirSync(path.join(generatedDir, target))) {
      if (!file.endsWith('.json')) continue
      const items: MissingItem[] = []
      const data = JSON.parse(
        fs.readFileSync(path.join(generatedDir, target, file), 'utf8')
      )
      walk(data, '', items, target !== 'core')
      if (items.length) files[path.basename(file, '.json')] = items
    }
    if (Object.keys(files).length) report.targets[target] = files
  }

  report.locations = locations.size
  return report
}

/**
 * Writes the report to `.vueform/api/missing.json` and returns its absolute
 * path.
 */
export function writeMissingReport(report: MissingReport): string {
  const file = path.join(generatedDir, 'missing.json')
  fs.writeFileSync(file, JSON.stringify(report, null, 2) + '\n')
  return file
}
