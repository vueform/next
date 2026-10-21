/**
 * Root bench runner (`pnpm test-bench`): runs every package's `test-bench`
 * script SEQUENTIALLY (benches must never share the CPU — contention wrecks
 * the numbers), with a live per-package row — spinner while running, then a
 * check or cross. When every package finished, each one's summary table is
 * dumped. Never a gate: the exit code only reflects whether the runs
 * themselves succeeded, regressions are informational.
 *
 * Arguments are forwarded to every package's script, so
 * `pnpm test-bench -- --compare <ref>` compares each package against the ref.
 *
 * Imports `./terminal` (utils' dist) statically — run `vpr :build:utils`
 * first on a fresh checkout.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  createPaint,
  createRows,
  resolveTerminalMode,
  trackChild,
  untrackChild,
} from './terminal'

const repoRoot = path.resolve(
  fileURLToPath(new URL('.', import.meta.url)),
  '..'
)
const forwardedArgs = process.argv.slice(2)

const mode = resolveTerminalMode()
const { bold, gray, red } = createPaint(mode.colors)

interface BenchPackage {
  name: string
  dir: string
}

const packagesDir = path.join(repoRoot, 'packages')
const benchPackages: BenchPackage[] = []

for (const entry of fs.readdirSync(packagesDir)) {
  const manifestPath = path.join(packagesDir, entry, 'package.json')
  if (!fs.existsSync(manifestPath)) continue
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  if (manifest.scripts?.['test-bench']) {
    benchPackages.push({ name: entry, dir: path.join(packagesDir, entry) })
  }
}

if (!benchPackages.length) {
  console.log('No package has a test-bench script.')
  process.exit(0)
}

const rows = createRows({
  title: 'Benchmarks',
  mode,
  rows: benchPackages.map(({ name }) => ({ id: name, label: name })),
})

interface BenchOutcome {
  name: string
  ok: boolean
  output: string
}

function runPackage(pkg: BenchPackage): Promise<BenchOutcome> {
  return new Promise((done) => {
    rows.start(pkg.name)

    const child = spawn('pnpm', ['run', 'test-bench', ...forwardedArgs], {
      cwd: pkg.dir,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    })
    trackChild(child)

    let output = ''
    const collect = (chunk: Buffer) => {
      output += chunk.toString()
    }
    child.stdout.on('data', collect)
    child.stderr.on('data', collect)

    child.on('close', (code) => {
      untrackChild(child)
      const ok = code === 0
      if (ok) rows.pass(pkg.name)
      else rows.fail(pkg.name, `exit ${code}`)
      done({ name: pkg.name, ok, output })
    })
  })
}

const outcomes: BenchOutcome[] = []

// Strictly one at a time — parallel benches contend for the CPU.
for (const pkg of benchPackages) {
  outcomes.push(await runPackage(pkg))
}

rows.finish()

// Dump each package's summary: from its comparison table onward when one was
// printed, the output's tail otherwise (and the full output on failure).
for (const outcome of outcomes) {
  console.log(`\n${bold(`===== ${outcome.name} =====`)}`)
  const lines = outcome.output.trimEnd().split('\n')
  const tableStart = lines.findLastIndex((line) =>
    line.startsWith('bench (min of')
  )
  if (!outcome.ok) {
    console.log(red(lines.slice(-60).join('\n')))
  } else if (tableStart >= 0) {
    console.log(lines.slice(tableStart).join('\n'))
  } else {
    console.log(gray(lines.slice(-20).join('\n')))
  }
}

const failed = outcomes.filter((o) => !o.ok)
process.exit(failed.length ? 1 : 0)
