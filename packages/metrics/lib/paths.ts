import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Absolute path of the metrics package root.
 */
export const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Monorepo root (dist artifacts of the measured packages live under it).
 */
export const monorepoRoot = resolve(pkgRoot, '../..')

/**
 * Committed results tree.
 */
export const resultsDir = resolve(pkgRoot, 'results')

/**
 * Raw measurement data (one json per suite plus benchmarks.json).
 */
export const jsonDir = resolve(resultsDir, 'json')

/**
 * Generated benchmark chart SVGs.
 */
export const chartsDir = resolve(resultsDir, 'charts')
