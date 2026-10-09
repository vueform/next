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

/**
 * Flat map: `<target>.<file>.<node path>` → the node's `loc` (empty when
 * the node has none).
 */
export type MissingReport = Record<string, string>

export interface MissingOptions {
  /**
   * Write locs as clickable `file://<abs>#L<line>` URLs instead of the
   * repo-relative `path:line` default.
   */
  fullPath?: boolean
}

/**
 * Every `loc` is listed once — the first occurrence wins (targets are
 * walked alphabetically, so that is core's).
 */
export function collectMissingDescriptions({
  fullPath,
}: MissingOptions = {}): MissingReport {
  const report: MissingReport = {}
  const locations = new Set<string>()

  const walk = (
    node: unknown,
    jsonPath: string,
    keyPrefix: string,
    excludeCoreLocs: boolean
  ) => {
    if (Array.isArray(node)) {
      node.forEach((child, i) =>
        walk(child, `${jsonPath}[${i}]`, keyPrefix, excludeCoreLocs)
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
      const duplicate =
        typeof record.loc === 'string' && locations.has(record.loc)
      if (!duplicate) {
        let loc = ''
        if (typeof record.loc === 'string') {
          if (fullPath) {
            // As a `file://<abs>#L<line>` URL the loc is clickable right in
            // the editor view of missing.json (the editor's link detector
            // only recognizes http/https/file schemes; the #L fragment
            // carries the line).
            const splitAt = record.loc.lastIndexOf(':')
            const relPath = record.loc.slice(0, splitAt)
            const line = record.loc.slice(splitAt + 1)
            loc = `file://${path.resolve(monorepoRoot, relPath)}#L${line}`
          } else {
            loc = record.loc
          }
          locations.add(record.loc)
        }
        report[`${keyPrefix}.${jsonPath}`] = loc
      }
    }

    for (const [key, child] of Object.entries(record)) {
      walk(
        child,
        jsonPath ? `${jsonPath}.${key}` : key,
        keyPrefix,
        excludeCoreLocs
      )
    }
  }

  for (const target of fs.readdirSync(generatedDir)) {
    if (target === 'logs') continue
    if (!fs.statSync(path.join(generatedDir, target)).isDirectory()) continue
    for (const file of fs.readdirSync(path.join(generatedDir, target))) {
      if (!file.endsWith('.json')) continue
      const data = JSON.parse(
        fs.readFileSync(path.join(generatedDir, target, file), 'utf8')
      )
      walk(
        data,
        '',
        `${target}.${path.basename(file, '.json')}`,
        target !== 'core'
      )
    }
  }

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
