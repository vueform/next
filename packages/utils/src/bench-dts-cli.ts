#!/usr/bin/env node
/**
 * `vf-bench-dts`: measures the invoking package's type-checking cost (see
 * `benchDts.ts`). Runs from the package's own directory, typically as its
 * `test:bench-dts` script.
 *
 *     pnpm test:bench-dts [measurement…] [--compare] [--save] [--runs=3]
 *
 * - no flags — measure and print absolutes
 * - `--compare` — also diff against the saved baseline
 * - `--save` — overwrite the baseline with this run
 * - `--runs=N` — repeat each measurement, report the median-total-time run
 * - positional arguments select specific fixtures by basename
 */
import { parseArgs } from 'node:util'

import { runBenchDts } from './benchDts'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    compare: { type: 'boolean', default: false },
    save: { type: 'boolean', default: false },
    runs: { type: 'string' },
    dir: { type: 'string' },
  },
})

runBenchDts({
  packageDir: process.cwd(),
  dir: values.dir,
  measurements: positionals,
  compare: values.compare,
  save: values.save,
  runs: values.runs ? Number(values.runs) : undefined,
})
  .then((ok) => {
    if (!ok) process.exit(1)
  })
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  })
