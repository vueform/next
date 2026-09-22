/**
 * Runs every scraper (or the ones named as arguments), writing the structural
 * json representations of core and the adapters into `.generated/` at the
 * monorepo root. Run with `pnpm scrape` from the root.
 *
 * Source scope flags (default: core + every adapter):
 *
 * - `--core` core only
 * - `--adapter=x,y` / `-a=x,y` the listed adapters
 * - `--ui`, `--pv` / `--primevue` shorthands for `--adapter=ui` / `=primevue`
 *
 * An adapter-scoped run merges against the existing `.generated/core` — when
 * that is missing (any requested file), core is scraped first automatically.
 */
import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

import { ensureIssueSources } from '../lib/issues'
import { assemble, FILES } from '../lib/output'
import { generatedDir, pkgRoot } from '../lib/paths'
import { parseScope } from '../lib/scope'

const { scope, rest } = parseScope(process.argv.slice(2))

const unknown = rest.filter(
  (name) => !FILES.includes(name as (typeof FILES)[number])
)
if (unknown.length) {
  console.error(
    `Unknown scraper(s): ${unknown.join(', ')} — available: ${FILES.join(', ')}`
  )
  process.exit(1)
}

const scrapers = rest.length ? rest : [...FILES]

// Adapter folders are merged on top of core — scrape core first when the
// existing core tree does not cover the requested files.
if (scope.adapters.length && !scope.core) {
  const missing = scrapers.filter(
    (name) => !fs.existsSync(path.join(generatedDir, 'core', `${name}.json`))
  )
  if (missing.length) {
    console.log(
      `[scrape] core is missing ${missing.join(', ')} — scraping core first`
    )
    scope.core = true
  }
}

const scopeFlags = [
  ...(scope.core ? ['--core'] : []),
  ...(scope.adapters.length ? [`--adapter=${scope.adapters.join(',')}`] : []),
]

const start = Date.now()

for (const name of scrapers) {
  console.log(`\x1b[36m▶ ${name}\x1b[0m`)
  execSync(
    `pnpm exec tsx ${path.join(pkgRoot, 'scrapers', `${name}.ts`)} ${scopeFlags.join(' ')}`,
    {
      cwd: pkgRoot,
      stdio: 'inherit',
    }
  )
}

assemble(scrapers, scope)
ensureIssueSources(scope)

const elapsed = ((Date.now() - start) / 1000).toFixed(1)
console.log(
  `\x1b[32m✓ Scraped ${scrapers.length} target(s) in ${elapsed}s\x1b[0m`
)
