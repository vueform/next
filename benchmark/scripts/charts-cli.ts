/**
 * Chart-only regeneration (root `pnpm bench:charts`): rebuilds the SVG charts
 * from the existing `results/json/benchmarks.json` without rerunning any
 * benchmarks — run `pnpm bench` first when the data itself is stale.
 */
import fs from 'node:fs'
import path from 'node:path'

import { generateCharts } from './charts'
import { RESULTS_JSON } from './lib'

const isTTY = process.stdout.isTTY === true
const paint = (code: string, text: string) =>
  isTTY ? `\x1b[${code}m${text}\x1b[0m` : text
const green = (t: string) => paint('32', t)
const dim = (t: string) => paint('2', t)

if (!fs.existsSync(RESULTS_JSON)) {
  console.error(
    `No benchmark results at ${path.relative(process.cwd(), RESULTS_JSON)} — run \`pnpm bench\` first.`
  )
  process.exit(1)
}

const results = JSON.parse(fs.readFileSync(RESULTS_JSON, 'utf8'))
const charts = generateCharts(results)

console.log(
  `${green(`${charts.length} charts regenerated`)} ${dim(`from ${path.relative(process.cwd(), RESULTS_JSON)}`)}`
)
