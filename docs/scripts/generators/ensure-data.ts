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

export const API_EXTRACTOR_HINT =
  'Run `pnpm api` at the monorepo root first (writes <root>/.vueform/api).'

export const JSON_TYPES_HINT =
  'Run `pnpm gen --types` in docs/ ' +
  '(or `pnpm exec tsx scripts/generators/json-types.ts`) first.'
