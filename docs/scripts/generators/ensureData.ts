import * as fs from 'node:fs'

/**
 * Exits with an actionable message when a generator's required input is
 * missing, instead of silently generating from empty data (which would e.g.
 * delete every "stale" page).
 */
export function requireData(tag: string, file: string, hint: string): void {
  if (fs.existsSync(file)) return
  console.error(`[${tag}] Missing ${file}`)
  console.error(`[${tag}] ${hint}`)
  process.exit(1)
}

export const SCRAPE_HINT =
  'Run `pnpm scrape` at the monorepo root first (writes <root>/.generated).'

export const JSON_TYPES_HINT =
  'Run `pnpm gen` in docs/ and pick "Regenerate JSON data" → types.json ' +
  '(or `pnpm exec tsx scripts/generators/json-types.ts`) first.'
