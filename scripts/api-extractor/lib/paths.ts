import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Absolute path of the api-extractor root (scripts/api-extractor).
 */
export const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Monorepo root (the extracted packages live under it).
 */
export const monorepoRoot = resolve(pkgRoot, '../..')

/**
 * Output tree: one json per scraper, with per-adapter `_<adapter>` subtrees.
 * Git-ignored — regenerate with `pnpm extract` at the monorepo root.
 */
export const generatedDir = resolve(monorepoRoot, '.vueform/api')
