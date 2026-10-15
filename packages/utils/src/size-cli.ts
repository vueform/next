#!/usr/bin/env node
/**
 * `vfd size`: measures the invoking package's bundle sizes (see `size/run.ts`).
 * Runs from the package's own directory, typically as its `size` script. The
 * suite — core building blocks, adapter components/themes or plugin cost — is
 * derived from the package's manifest.
 *
 *     pnpm size [--only=a,b] [--stats] [--list]
 *     pnpm size:report
 *
 * - `--only=a,b` rerun only the matching scenarios (by name, component, item or
 *   plugin), merging into the previous results
 * - `--stats` also emit rollup-visualizer treemaps (kept under the package's
 *   `node_modules/.cache/vf-size/stats/`)
 * - `--list` print the suite's scenarios without building
 * - `--report` only regenerate the README's size section from the existing
 *   `size.json`, without building anything
 */
import { parseArgs } from 'node:util'

import { runSize } from './size/run'

const { values } = parseArgs({
  options: {
    only: { type: 'string' },
    stats: { type: 'boolean', default: false },
    list: { type: 'boolean', default: false },
    report: { type: 'boolean', default: false },
  },
})

runSize({
  packageDir: process.cwd(),
  only: values.only?.split(','),
  stats: values.stats,
  list: values.list,
  report: values.report,
}).catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
