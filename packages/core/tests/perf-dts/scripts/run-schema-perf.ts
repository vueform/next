/**
 * Typechecks types-perf fixtures with --extendedDiagnostics and upserts the
 * results into `benchmarks/types/.results/results.json` keyed by `measurement →
 * commit`.
 *
 * Each fixture is measured in its own isolated `vue-tsc` run: a transient
 * `tsconfig.measure.json` (gitignored) is generated next to the static perf
 * tsconfig, scoping the program to that fixture plus the measured src slices.
 *
 * Usage: pnpm tsc:perf # every benchmarks/types/suites/*.ts fixture pnpm
 * tsc:perf -- define-schema-500 # a single fixture pnpm tsc:perf -- report
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import {
  fixturePathFor,
  gitHead,
  outDir,
  parseDiagnostics,
  comparisonTarget,
  printComparison,
  readResults,
  reportPath,
  resultsPath,
  rootDir,
  measureTsconfigPath,
  upsertResult,
  writeReport,
  writeResults,
  type Result,
} from './schema-perf-shared'

/**
 * Every `benchmarks/types/suites/*.ts` fixture, by measurement name.
 */
function allMeasurements(): string[] {
  return readdirSync(outDir)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => f.slice(0, -'.ts'.length))
    .sort()
}

function writeTsconfig(measurement: string) {
  writeFileSync(
    measureTsconfigPath,
    `${JSON.stringify(
      {
        extends: './tsconfig.json',
        include: [
          `./suites/${measurement}.ts`,
          '../../../src/components/**/*.ts',
          '../../../src/components/**/*.vue',
          '../../../src/blueprints/**/*.ts',
          '../../../src/features/**/*.ts',
          '../../../src/composables/**/*.ts',
          '../../../src/contexts/**/*.ts',
          '../../../src/helpers/**/*.ts',
          '../../../src/types/**/*.ts',
          '../../../src/utils/**/*.ts',
          '../../../src/modules/**/*.ts',
          '../../../src/index.ts',
        ],
      },
      null,
      2
    )}\n`
  )
}

function measure(measurement: string): Result {
  writeTsconfig(measurement)
  console.log(`Measuring ${measurement}.ts…`)

  const result = spawnSync(
    'pnpm',
    [
      'exec',
      'vue-tsc',
      '--project',
      'benchmarks/types/tsconfig.measure.json',
      '--extendedDiagnostics',
    ],
    {
      cwd: rootDir,
      encoding: 'utf8',
      shell: true,
      env: {
        ...process.env,
        // tsc's "Memory used" is `heapUsed`, preceded by `global.gc()` only
        // when it exists. Exposing gc makes it post-collection live heap
        // instead of whatever garbage happens to be pending — far less noisy.
        NODE_OPTIONS: [process.env.NODE_OPTIONS, '--expose-gc']
          .filter(Boolean)
          .join(' '),
      },
    }
  )

  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  process.stdout.write(output)

  const metrics = parseDiagnostics(output)
  const ok = (result.status ?? 1) === 0 && metrics != null

  return {
    timestamp: new Date().toISOString(),
    ok,
    metrics,
  }
}

const args = process.argv.slice(2).filter((a) => a !== '--')

if (args[0] === 'report') {
  writeReport(readResults())
  console.log(`Report → ${reportPath}`)
  process.exit(0)
}

const measurements = args[0] ? [args[0]] : allMeasurements()

if (measurements.length === 0) {
  console.error(`No fixtures found in ${outDir}`)
  process.exit(1)
}

for (const measurement of measurements) {
  const fixturePath = fixturePathFor(measurement)
  if (!existsSync(fixturePath)) {
    console.error(`Missing fixture: ${fixturePath}`)
    console.error('Expected benchmarks/types/suites/<measurement>.ts')
    process.exit(1)
  }
}

const commit = gitHead()
if (!commit) {
  console.error('Could not resolve git HEAD; results are keyed by commit id.')
  process.exit(1)
}

let allOk = true

try {
  for (const measurement of measurements) {
    const existing = readResults()
    // Capture before upsert so re-runs can diff against the prior same-commit value.
    const previous = comparisonTarget(existing, measurement, commit)
    const result = measure(measurement)
    const results = upsertResult(existing, measurement, commit, result)
    writeResults(results)
    writeReport(results)
    printComparison(measurement, commit, result, previous)
    console.log('')
    allOk &&= result.ok
  }
} finally {
  if (existsSync(measureTsconfigPath)) rmSync(measureTsconfigPath)
}

console.log(`Results → ${resultsPath}`)
console.log(`Report  → ${reportPath}`)

process.exit(allOk ? 0 : 1)
