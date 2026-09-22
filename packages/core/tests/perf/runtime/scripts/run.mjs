import { spawnSync } from 'node:child_process'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  flattenMemoryJson,
  flattenTimeJson,
  printComparison,
} from './compare.mjs'
import {
  comparisonTarget,
  gitHead,
  historyPath,
  readHistory,
  rebaseHistory,
  reportPath,
  resultsDir,
  upsertHistory,
  writeHistory,
  writeReport,
} from './report.mjs'

const save = process.argv.includes('--save')
const reportOnly =
  process.argv.includes('--report') || process.argv[2] === 'report'
const rebase =
  process.argv.includes('--rebase') || process.argv[2] === 'rebase'

const here = dirname(fileURLToPath(import.meta.url))
const coreDir = resolve(here, '../../..')
const timePath = resolve(resultsDir, 'time.json')
const memoryPath = resolve(resultsDir, 'memory.json')
const currentPath = resolve(resultsDir, 'current.json')
const baselinePath = resolve(resultsDir, 'baseline.json')

mkdirSync(resultsDir, { recursive: true })

if (rebase) {
  const history = readHistory()
  if (!Object.keys(history).length) {
    console.error('No history to rebase. Run `pnpm bench:perf` first.')
    process.exit(1)
  }
  const commit = process.argv
    .slice(2)
    .find((a) => !a.startsWith('--') && a !== 'rebase')
  let next
  try {
    next = rebaseHistory(history, commit)
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
  writeHistory(next)
  writeReport(next)
  console.log(`Base is now ${Object.keys(next).find((id) => next[id].base)}`)
  console.log(`Report → ${reportPath}`)
  process.exit(0)
}

if (reportOnly) {
  let history = readHistory()
  if (!Object.keys(history).length && existsSync(currentPath)) {
    const commit = gitHead() ?? 'unknown'
    const current = JSON.parse(readFileSync(currentPath, 'utf8'))
    history = upsertHistory({}, commit, current)
    writeHistory(history)
  }
  writeReport(history)
  console.log(`Report → ${reportPath}`)
  process.exit(0)
}

function run(command, args, extraEnv = {}) {
  const result = spawnSync(command, args, {
    cwd: coreDir,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

console.log('\n▸ Time benches\n')

run('pnpm', [
  'exec',
  'vitest',
  'bench',
  '--run',
  '--config',
  'tests/perf/runtime/vitest.config.ts',
  '--outputJson',
  timePath,
])

console.log('\n▸ Memory benches\n')

run(
  'pnpm',
  [
    'exec',
    'vitest',
    'run',
    '--config',
    'tests/perf/runtime/vitest.memory.config.ts',
    '--execArgv=--expose-gc',
  ],
  {
    NODE_OPTIONS: [process.env.NODE_OPTIONS, '--expose-gc']
      .filter(Boolean)
      .join(' '),
  }
)

const timeJson = existsSync(timePath)
  ? JSON.parse(readFileSync(timePath, 'utf8'))
  : {}
const memoryJson = existsSync(memoryPath)
  ? JSON.parse(readFileSync(memoryPath, 'utf8'))
  : { cases: [] }

const current = {
  time: flattenTimeJson(timeJson),
  memory: flattenMemoryJson(memoryJson),
}

if (!Object.keys(current.time).length) {
  console.warn(
    'Warning: no time benches parsed from outputJson. Raw keys:',
    Object.keys(timeJson)
  )
}

writeFileSync(currentPath, JSON.stringify(current, null, 2))

const commit = gitHead()
const existing = readHistory()
const previous = commit ? comparisonTarget(existing, commit) : undefined

if (!commit) {
  console.warn('Could not resolve git HEAD; history was not updated.')
} else {
  const history = upsertHistory(existing, commit, current)
  writeHistory(history)
  writeReport(history)
  console.log(`\nHistory → ${historyPath} (${commit})`)
  console.log(`Report  → ${reportPath}`)
}

if (save) {
  copyFileSync(currentPath, baselinePath)
  console.log(`Saved baseline → ${baselinePath}`)
}

if (existsSync(baselinePath)) {
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'))
  printComparison(current, baseline)
} else if (previous) {
  printComparison(current, previous.entry)
} else {
  console.log(
    '\nNo baseline yet. Run `pnpm bench:perf:save` on the pre-change state.\n'
  )
}
