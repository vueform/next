import * as fs from 'node:fs'
import * as path from 'node:path'

import { generatedDir } from './paths'
import type { ScrapeScope } from './scope'

/**
 * `.generated/issues.json`: everything the scrape found wanting, keyed by
 * source (`core` or an adapter name). Written by the scrapers, displayed by
 * `pnpm scrape:issues` and `pnpm scrape:validate` — the data files themselves
 * stay clean.
 */
export interface Issue {
  /**
   * Dotted path of the affected item, e.g. `makeItems.config.conditions`.
   */
  name: string
  /**
   * `ambiguous` = its sources disagree on a description; `flagged` = its
   * docblock holds only `@write`, no prose; `missing` = no source has one.
   */
  reason: 'ambiguous' | 'flagged' | 'missing'
  /**
   * Source location, relative to the monorepo root.
   */
  file?: string
  /**
   * 1-based line of the declaration.
   */
  line?: number
}

export const issuesFile = path.join(generatedDir, 'issues.json')

export function readIssues(): Record<string, Issue[]> {
  return fs.existsSync(issuesFile)
    ? JSON.parse(fs.readFileSync(issuesFile, 'utf-8'))
    : {}
}

/**
 * Replaces one source's issues, keeping the others (a scoped scrape only
 * refreshes what it scraped).
 */
export function updateIssues(source: string, issues: Issue[]): void {
  const all = readIssues()
  all[source] = [...issues].sort((a, b) => a.name.localeCompare(b.name))

  const sorted: Record<string, Issue[]> = {}
  for (const key of Object.keys(all).sort()) sorted[key] = all[key]

  fs.mkdirSync(generatedDir, { recursive: true })
  fs.writeFileSync(issuesFile, JSON.stringify(sorted, null, 2) + '\n')
}

/**
 * Replaces one source's issues whose names start with `prefix`, keeping that
 * source's other rows (each scraper owns a name prefix — e.g. the assemble
 * class check owns `classes.` — so writers never clobber each other).
 */
export function mergeIssues(
  source: string,
  prefix: string,
  issues: Issue[]
): void {
  const all = readIssues()
  const kept = (all[source] ?? []).filter((i) => !i.name.startsWith(prefix))
  all[source] = [...kept, ...issues].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  const sorted: Record<string, Issue[]> = {}
  for (const key of Object.keys(all).sort()) sorted[key] = all[key]

  fs.mkdirSync(generatedDir, { recursive: true })
  fs.writeFileSync(issuesFile, JSON.stringify(sorted, null, 2) + '\n')
}

/**
 * Guarantees `issues.json` exists and has an entry for every scoped source — an
 * empty array when a source has no issues. Called on every scrape run.
 */
export function ensureIssueSources(scope: ScrapeScope): void {
  const all = readIssues()
  const sources = [...(scope.core ? ['core'] : []), ...scope.adapters]

  let changed = !fs.existsSync(issuesFile)
  for (const source of sources) {
    if (!(source in all)) {
      all[source] = []
      changed = true
    }
  }
  if (!changed) return

  const sorted: Record<string, Issue[]> = {}
  for (const key of Object.keys(all).sort()) sorted[key] = all[key]
  fs.mkdirSync(generatedDir, { recursive: true })
  fs.writeFileSync(issuesFile, JSON.stringify(sorted, null, 2) + '\n')
}

/**
 * The scoped issues as unique report rows (a `core` issue is not repeated per
 * adapter — sources are where things get fixed).
 */
export function scopedIssues(scope: ScrapeScope): Issue[] {
  const all = readIssues()
  const sources = [...(scope.core ? ['core'] : []), ...scope.adapters]

  const unique = new Map<string, Issue>()
  for (const source of sources) {
    for (const issue of all[source] ?? []) {
      const key = `${issue.name}@${issue.file ?? ''}:${issue.line ?? ''}`
      if (!unique.has(key)) unique.set(key, issue)
    }
  }
  return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Prints the aligned report; the trailing `file:line` is clickable in editors'
 * terminals.
 */
export function printIssues(rows: Issue[]): void {
  if (!rows.length) {
    console.log('[issues] none — everything documented')
    return
  }

  const nameWidth = Math.max(...rows.map((r) => r.name.length))
  const reasonWidth = Math.max(...rows.map((r) => r.reason.length))

  console.warn(
    `\n[issues] ${rows.length} undocumented item(s) — add a description at the source:`
  )
  for (const row of rows) {
    const location =
      row.file && row.line ? `${row.file}:${row.line}` : '(no source location)'
    console.warn(
      `  ${row.name.padEnd(nameWidth)}  ${row.reason.padEnd(reasonWidth)}  ${location}`
    )
  }
  console.warn('')
}
