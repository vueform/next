/**
 * Runtime-bench runner (`pnpm test-bench` in a package with `tests/bench/`).
 *
 * Run from a package directory. By default it runs the package's bench suite
 * on the CURRENT tree and reports the numbers — no comparison, no gate. With
 * `--compare [ref]` (short: `-c` / `-C`) it also runs the suite in a worktree
 * at `ref` (current HEAD when the flag carries no value) and prints the
 * deltas. Never a gate: regressions are reported, the exit code only reflects
 * whether the runs themselves succeeded.
 *
 * The suite runs against BUILT DIST (see the factory's `bench` project), so
 * each leg's packages are built first — the current tree on every invocation
 * (`--skip-build` opts out), worktrees on creation. The current tree's
 * `tests/bench/` files and this harness (utils `src/bench/` + `src/vitest.ts`)
 * are overlaid into the comparison worktree, so the identical suite runs on
 * both trees even when the ref predates it.
 *
 * Noise handling in compare mode: legs run in ALTERNATING ROUNDS (`--rounds`,
 * default 2 when comparing, 1 otherwise) so thermal/CPU drift hits both trees
 * symmetrically, and the compared statistic is each bench's MINIMUM across a
 * leg's rounds — noise only ever adds time, so the minimum is the most
 * drift-resistant number a laptop can produce. Report-first: trust large,
 * consistent deltas; single-digit percentages on sub-millisecond benches are
 * weather.
 *
 * Every run persists under `.vueform/bench/logs/<stamp>-<pkg>…/`: the live
 * vitest output of every leg (`<label>.log` + combined `output.log`), the
 * per-leg JSONs, the rendered table (`summary.txt`) and a structured
 * `run.json`.
 *
 * Flags: --compare [ref] (-c, -C) | --rounds <n> | --threshold <pct=10> |
 *        --keep (keep the worktree) | --skip-build (trust current dist)
 */
import { execFileSync, execSync, spawn } from 'node:child_process'
import {
  cpSync,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { join, resolve } from 'node:path'

const pkgDir = process.cwd()
const repoRoot = resolve(pkgDir, '..', '..')
const benchDir = join(repoRoot, '.vueform', 'bench')
const harnessDir = join(repoRoot, 'packages', 'utils', 'src', 'bench')

const pkgName = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'))
  .name as string
const pkgShort = pkgName.replace(/^@[^/]+\//, '')

const args = process.argv.slice(2)
const flag = (name: string) => args.includes(`--${name}`)
const opt = (name: string): string | undefined => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}

// --compare / -c / -C, with an optional ref value (HEAD when omitted).
const compareFlag = (() => {
  for (const name of ['--compare', '-c', '-C']) {
    const i = args.indexOf(name)
    if (i < 0) continue
    const next = args[i + 1]
    return { ref: next && !next.startsWith('-') ? next : 'HEAD' }
  }
  return undefined
})()

const thresholdPct = Number(opt('threshold') ?? 10)
const absFloorMs = 0.05
const keep = flag('keep')
const rounds = Math.max(1, Number(opt('rounds') ?? (compareFlag ? 2 : 1)))

const git = (cmd: string, cwd = repoRoot) =>
  execSync(`git ${cmd}`, { cwd, encoding: 'utf8' }).trim()

// Written by the sibling reporter.ts (`--reporter` is the only JSON channel
// in vitest 5). The comparator works on each bench's minimum latency.
function parseBenchJson(file: string): Map<string, number> {
  const out = new Map<string, number>()
  const data = JSON.parse(readFileSync(file, 'utf8'))
  for (const b of data.benchmarks ?? []) {
    out.set(b.name, b.min ?? b.mean)
  }
  return out
}

// Per-bench minimum across a leg's rounds.
function mergeRounds(files: string[]): Map<string, number> {
  const merged = new Map<string, number>()
  for (const file of files) {
    for (const [name, min] of parseBenchJson(file)) {
      const current = merged.get(name)
      if (current === undefined || min < current) merged.set(name, min)
    }
  }
  return merged
}

// Refs older than the vitest 5 harness cannot run the overlaid suite.
function benchable(ref: string): boolean {
  const workspace = git(`show ${ref}:pnpm-workspace.yaml`)
  const major = Number(/vitest: (\d+)/.exec(workspace)?.[1] ?? 0)
  return major >= 5
}

// The packages the dist-based suite loads at runtime, plus the current one.
// Built in topological order by pnpm.
const BENCH_PACKAGES = [
  ...new Set([
    '@vueform/utils',
    '@vueform/expr-eval',
    '@vueform/core',
    pkgName,
  ]),
]

function buildDist(dir: string, label: string) {
  console.log(
    `[bench] ${label}: building dist (${BENCH_PACKAGES.join(', ')})...`
  )
  execFileSync(
    'pnpm',
    BENCH_PACKAGES.flatMap((p) => ['--filter', p]).concat(['run', 'build']),
    { cwd: dir, stdio: ['ignore', 'ignore', 'inherit'] }
  )
}

const reporterPath = join(harnessDir, 'reporter.ts')

// The run's persistent log directory, set before the legs run.
let logDir = join(benchDir, 'logs', 'unresolved')

// Runs one leg, streaming the live vitest output to the terminal AND teeing
// it verbatim into `<label>.log` plus the run-wide `output.log`.
function runLeg(label: string, dir: string): Promise<string> {
  const jsonPath = join(logDir, `${label}.json`)
  mkdirSync(logDir, { recursive: true })
  rmSync(jsonPath, { force: true })

  const legPkgDir = join(dir, 'packages', pkgShort)

  console.log(`\n[bench] ${label}: running suite...`)

  const legLog = createWriteStream(join(logDir, `${label}.log`))
  const combined = createWriteStream(join(logDir, 'output.log'), {
    flags: 'a',
  })
  combined.write(`\n===== ${label} (${new Date().toISOString()}) =====\n`)

  return new Promise((done, fail) => {
    const child = spawn(
      'pnpm',
      // No `--project bench`: v5 prunes empty-include projects before the
      // filter runs. Bench mode already selects the bench project alone,
      // since every other project carries an empty `benchmark.include`.
      [
        'exec',
        'vitest',
        'bench',
        '--run',
        '--reporter',
        'default',
        '--reporter',
        reporterPath,
      ],
      {
        cwd: legPkgDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          // Mount benches churn full forms; without a raised heap the worker
          // dies with SIGABRT.
          NODE_OPTIONS:
            `${process.env.NODE_OPTIONS ?? ''} --max-old-space-size=8192`.trim(),
          BENCH_OUTPUT_JSON: jsonPath,
        },
      }
    )

    const tee = (out: NodeJS.WriteStream) => (chunk: Buffer) => {
      out.write(chunk)
      legLog.write(chunk)
      combined.write(chunk)
    }
    child.stdout.on('data', tee(process.stdout))
    child.stderr.on('data', tee(process.stderr))

    child.on('close', (code) => {
      legLog.end()
      combined.end()
      if (code === 0) done(jsonPath)
      else fail(new Error(`[bench] ${label} leg failed (exit ${code})`))
    })
  })
}

function prepareWorktree(ref: string): string {
  const sha = git(`rev-parse --short ${ref}`)
  const dir = join(benchDir, 'worktrees', sha)
  if (!existsSync(dir)) {
    console.log(`[bench] preparing worktree for ${ref} (${sha})...`)
    git(`worktree add --force --detach ${dir} ${sha}`)
  }
  if (!existsSync(join(dir, 'node_modules'))) {
    execFileSync('pnpm', ['install', '--reporter=silent'], {
      cwd: dir,
      stdio: ['ignore', 'ignore', 'inherit'],
    })
  }

  // The identical suite runs on both trees: overlay the current harness
  // (fixtures/reporter + the factory's bench project) and the package's bench
  // files, since the ref may predate any of them.
  cpSync(harnessDir, join(dir, 'packages', 'utils', 'src', 'bench'), {
    recursive: true,
  })
  cpSync(
    join(repoRoot, 'packages', 'utils', 'src', 'vitest.ts'),
    join(dir, 'packages', 'utils', 'src', 'vitest.ts')
  )
  const targetBench = join(dir, 'packages', pkgShort, 'tests', 'bench')
  rmSync(targetBench, { recursive: true, force: true })
  cpSync(join(pkgDir, 'tests', 'bench'), targetBench, { recursive: true })

  // utils carries the overlaid factory — rebuild it every time; the heavy
  // package dists only when absent (a worktree's own code never changes).
  execFileSync('pnpm', ['--filter', '@vueform/utils', 'run', 'build'], {
    cwd: dir,
    stdio: ['ignore', 'ignore', 'inherit'],
  })
  if (!existsSync(join(dir, 'packages', pkgShort, 'dist'))) {
    buildDist(dir, `worktree ${sha}`)
  }

  return dir
}

function cleanupWorktree(ref: string) {
  const sha = git(`rev-parse --short ${ref}`)
  const dir = join(benchDir, 'worktrees', sha)
  if (existsSync(dir)) {
    git(`worktree remove --force ${dir}`)
  }
}

interface Delta {
  pct: number
  significant: boolean
}

function delta(head: number, ref: number): Delta {
  // Sub-microsecond references (fully quantized benches) have no meaningful
  // relative delta; the absolute floor governs significance anyway.
  if (ref < 0.0001) return { pct: 0, significant: false }
  const diff = head - ref
  const pct = (diff / ref) * 100
  const significant = diff > absFloorMs && pct > thresholdPct
  return { pct, significant }
}

const fmt = (d: Delta | undefined) =>
  d === undefined
    ? '      —'
    : `${d.pct >= 0 ? '+' : ''}${d.pct.toFixed(1).padStart(5)}%${d.significant ? ' ⚠' : ''}`

// ---------------------------------------------------------------------------

const headSha = git('rev-parse --short HEAD')
const headDirty = git('status --porcelain') !== ''

const compareRef = compareFlag?.ref
const compareSha = compareRef ? git(`rev-parse --short ${compareRef}`) : null

if (compareRef && !benchable(compareRef)) {
  console.error(
    `[bench] ${compareRef} predates the vitest 5 bench harness; pass a newer ref.`
  )
  process.exit(1)
}

const runStamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
logDir = join(
  benchDir,
  'logs',
  `${runStamp}-${pkgShort}-${headSha}${compareSha ? `-vs-${compareSha}` : ''}`
)

console.log(`[bench] package: ${pkgName}`)
console.log(
  `[bench] current: ${headSha}${headDirty ? '+dirty' : ''} (working tree)`
)
if (compareSha) console.log(`[bench] compare: ${compareSha} (${compareRef})`)
console.log(`[bench] log:     ${logDir}`)

// The current tree changes between runs — rebuild unless explicitly skipped.
if (!flag('skip-build')) {
  buildDist(repoRoot, 'current')
}

const compareDir = compareRef ? prepareWorktree(compareRef) : null

const currentJsons: string[] = []
const compareJsons: string[] = []

// Alternating rounds: thermal and CPU-state drift hits both trees
// symmetrically instead of biasing whichever leg ran later.
for (let round = 1; round <= rounds; round++) {
  const suffix = rounds > 1 ? `-r${round}` : ''
  currentJsons.push(await runLeg(`current${suffix}`, repoRoot))
  if (compareDir) {
    compareJsons.push(await runLeg(`compare${suffix}`, compareDir))
  }
}

const current = mergeRounds(currentJsons)
const reference = compareDir ? mergeRounds(compareJsons) : undefined

let regressions = 0
const tableLines: string[] = []
const results: Record<string, any>[] = []

tableLines.push(
  `${('bench (min of ' + rounds + ' round(s))').padEnd(64)} ${'ms'.padStart(9)}${reference ? ` ${('vs ' + compareSha).padStart(8)}` : ''}`
)
for (const [name, value] of current) {
  const ref = reference?.get(name)
  const d = ref !== undefined ? delta(value, ref) : undefined
  if (d?.significant) regressions++
  results.push({
    name,
    current: value,
    compare: ref,
    pct: d?.pct,
    significant: !!d?.significant,
  })
  tableLines.push(
    `${name.slice(0, 64).padEnd(64)} ${value.toFixed(3).padStart(9)}${reference ? ` ${fmt(d)}` : ''}`
  )
}
if (reference) {
  for (const name of reference.keys()) {
    if (!current.has(name))
      tableLines.push(`${name.slice(0, 64).padEnd(64)}   (removed)`)
  }
}

const verdict = !reference
  ? `✓ ${current.size} benches measured`
  : regressions > 0
    ? `⚠ ${regressions} bench(es) slower than ${compareSha} beyond ${thresholdPct}% — informational, not a gate`
    : `✓ no significant regressions vs ${compareSha}`

console.log(`\n${tableLines.join('\n')}`)

// Persist the run: the rendered table with its metadata, and a structured
// result for diffing runs programmatically. Leg logs and JSONs are already in
// the same directory.
const meta = [
  `date:      ${new Date().toISOString()}`,
  `package:   ${pkgName}`,
  `current:   ${headSha}${headDirty ? '+dirty' : ''}`,
  `compare:   ${compareSha ?? '—'}`,
  `rounds:    ${rounds}`,
  `threshold: ${thresholdPct}%`,
  `argv:      ${args.join(' ')}`,
]
writeFileSync(
  join(logDir, 'summary.txt'),
  [...meta, '', ...tableLines, '', verdict, ''].join('\n')
)
writeFileSync(
  join(logDir, 'run.json'),
  JSON.stringify(
    {
      date: new Date().toISOString(),
      package: pkgName,
      current: headSha,
      currentDirty: headDirty,
      compare: compareSha,
      rounds,
      thresholdPct,
      regressions,
      results,
    },
    null,
    2
  )
)
console.log(`\n[bench] log: ${logDir}`)

if (compareRef && !keep) {
  cleanupWorktree(compareRef)
}

console.log(`\n${regressions > 0 ? '\x1b[33m' : '\x1b[32m'}${verdict}\x1b[0m`)
