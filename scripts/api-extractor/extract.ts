/**
 * API extraction orchestrator (`pnpm extract`): runs every scraper (or the ones
 * selected by target flags) as a task list with per-task progress bars — the
 * same renderer as `pnpm build` / `pnpm check` — closing with an `assemble`
 * task that writes the structural json representations of core and the adapters
 * into `.api/` at the monorepo root. The scrapers' own output stays captured
 * (dumped only on failure); undocumented items are summarized after the queue
 * with the path to `.api/issues.json`.
 *
 * Target flags (default: every target): `--tokens`, `--classes`, … — one per
 * output file, combinable (`pnpm extract --tokens --classes`). Selection is
 * normalized to the canonical order, so dependent scrapers (features reads the
 * blueprints output) always run after their inputs.
 *
 * Source scope flags (default: core + every adapter):
 *
 * - `--core` core only
 * - `--adapter=x,y` / `-a=x,y` the listed adapters
 * - `--ui`, `--pv` / `--primevue` shorthands for `--adapter=ui` / `=primevue`
 *
 * An adapter-scoped run merges against the existing `.api/core` — when that is
 * missing (any requested file), core is scraped first automatically.
 */
import * as fs from 'node:fs'
import * as path from 'node:path'

import { dim, runQueue, yellow, type Task } from '../runner'
import { issuesFile, scopedIssues } from './lib/issues'
import { FILES } from './lib/output'
import { generatedDir, monorepoRoot, pkgRoot } from './lib/paths'
import { parseScope } from './lib/scope'

const DEFAULT_MS: Record<string, number> = {
  blueprints: 4_000,
  components: 4_000,
  default: 1_500,
}

const { scope, rest } = parseScope(process.argv.slice(2))

const requested = new Set<string>()
const unknown: string[] = []
for (const arg of rest) {
  const name = arg.startsWith('--') ? arg.slice(2) : undefined
  if (name && FILES.includes(name as (typeof FILES)[number])) {
    requested.add(name)
  } else {
    unknown.push(arg)
  }
}
if (unknown.length) {
  console.error(
    `Unknown flag(s): ${unknown.join(', ')} — available targets: ${FILES.map(
      (name) => `--${name}`
    ).join(', ')}`
  )
  process.exit(1)
}

// Canonical order regardless of flag order — features depends on blueprints.
const scrapers = requested.size
  ? FILES.filter((name) => requested.has(name))
  : [...FILES]

// Adapter folders are merged on top of core — scrape core first when the
// existing core tree does not cover the requested files.
if (scope.adapters.length && !scope.core) {
  const missing = scrapers.filter(
    (name) => !fs.existsSync(path.join(generatedDir, 'core', `${name}.json`))
  )
  if (missing.length) {
    console.log(
      dim(`core is missing ${missing.join(', ')} — scraping core first`)
    )
    scope.core = true
  }
}

const scopeFlags = [
  ...(scope.core ? ['--core'] : []),
  ...(scope.adapters.length ? [`--adapter=${scope.adapters.join(',')}`] : []),
]

const task = (id: string, script: string, args: string[]): Task => ({
  id,
  timeKey: id,
  aliases: [],
  cwd: pkgRoot,
  cmd: 'pnpm',
  args: ['exec', 'tsx', path.join(pkgRoot, script), ...args],
})

const queue: Task[] = [
  ...scrapers.map((name) =>
    task(name, path.join('scrapers', `${name}.ts`), scopeFlags)
  ),
  task('assemble', 'assemble.ts', [...scopeFlags, ...scrapers]),
]

/**
 * The undocumented-item count with the report file, in the style of verify's
 * test-warn summary — or nothing when the scoped sources are clean.
 */
function issueSummary(): string | undefined {
  const issues = scopedIssues(scope)
  if (issues.length === 0) return undefined
  const file = path.relative(monorepoRoot, issuesFile)
  return `${yellow(
    `⚠ ${issues.length} undocumented item${issues.length > 1 ? 's' : ''} found`
  )}${dim(` — ${file}`)}`
}

runQueue(queue, {
  timesScope: 'extract',
  defaultMs: (t: Task) => DEFAULT_MS[t.id] ?? DEFAULT_MS.default,
  verb: 'extracting',
  doneVerb: 'Extracted',
  epilogue: issueSummary,
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
