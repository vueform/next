/**
 * Runtime-bench regression test (`pnpm test:bench` in core).
 *
 * Same-machine A/B/C comparison: runs the bench suite in the CURRENT tree
 * (head), in a worktree at the BASE ref (default: merge-base with main; the
 * change being judged) and in a worktree at the ANCHOR (always the latest
 * tag — drift accumulates against it, so sub-threshold creep still trips
 * eventually). All legs run fresh on this machine, so machine-to-machine
 * noise cancels; stored numbers are never compared.
 *
 * A bench regresses when head is slower than the reference by BOTH the
 * relative threshold and a significance floor (absolute ms + the two runs'
 * margins of error). Exit is 0 unless `--fail-on-regression` (the CI/bisect
 * switch: `git bisect run pnpm test:bench --fail-on-regression --no-anchor
 * --base <good>`).
 *
 * Flags: --base <ref> | --no-anchor | --fail-on-regression |
 *        --threshold <pct=10> | --keep (keep worktrees for debugging)
 */
import { execFileSync, execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgDir = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..')
const repoRoot = resolve(pkgDir, '..', '..')
const benchDir = join(repoRoot, '.vueform', 'bench')

const args = process.argv.slice(2)
const flag = (name: string) => args.includes(`--${name}`)
const opt = (name: string): string | undefined => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}

const thresholdPct = Number(opt('threshold') ?? 10)
const absFloorMs = 0.05
const failOnRegression = flag('fail-on-regression')
const keep = flag('keep')

const git = (cmd: string, cwd = repoRoot) =>
  execSync(`git ${cmd}`, { cwd, encoding: 'utf8' }).trim()

interface BenchResult {
  mean: number
  moe: number
}

// Written by the sibling reporter.ts (`--reporter` is the only JSON channel
// in vitest 5 — `benchmark.outputJson` was removed).
function parseBenchJson(file: string): Map<string, BenchResult> {
  const out = new Map<string, BenchResult>()
  const data = JSON.parse(readFileSync(file, 'utf8'))
  for (const b of data.benchmarks ?? []) {
    out.set(b.name, { mean: b.mean, moe: b.moe ?? 0 })
  }
  return out
}

/**
 * Refs older than the vitest 5 bump (fixture-style bench files, no
 * `--outputJson`) cannot run under this harness.
 */
function benchable(ref: string): boolean {
  const workspace = git(`show ${ref}:pnpm-workspace.yaml`)
  const major = Number(/vitest: (\d+)/.exec(workspace)?.[1] ?? 0)
  return major >= 5
}

const reporterPath = join(pkgDir, 'tests', 'bench', 'reporter.ts')

function runLeg(label: string, dir: string, local: boolean): string {
  const jsonPath = join(benchDir, 'results', `${label}.json`)
  mkdirSync(join(benchDir, 'results'), { recursive: true })
  rmSync(jsonPath, { force: true })

  const coreDir = join(dir, 'packages', 'core')
  const manifest = JSON.parse(
    readFileSync(join(coreDir, 'package.json'), 'utf8')
  )
  // Foreign trees run THEIR OWN era's raw runner; `test:bench:run` when the
  // era has it, else the pre-orchestrator raw `test:bench`.
  const script =
    local || manifest.scripts['test:bench:run']
      ? 'test:bench:run'
      : 'test:bench'

  console.log(`\n[bench] ${label}: running suite (${script})...`)
  execFileSync(
    'pnpm',
    [
      'run',
      script,
      '--run',
      '--reporter',
      'default',
      '--reporter',
      reporterPath,
    ],
    {
      cwd: coreDir,
      stdio: 'inherit',
      env: { ...process.env, BENCH_OUTPUT_JSON: jsonPath },
    }
  )
  return jsonPath
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
  if (!existsSync(join(dir, 'packages', 'utils', 'dist'))) {
    execFileSync('pnpm', ['--filter', '@vueform/utils', 'run', 'build'], {
      cwd: dir,
      stdio: ['ignore', 'ignore', 'inherit'],
    })
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

function delta(head: BenchResult, ref: BenchResult): Delta {
  const diff = head.mean - ref.mean
  const pct = (diff / ref.mean) * 100
  const significant =
    diff > Math.max(absFloorMs, head.moe + ref.moe) && pct > thresholdPct
  return { pct, significant }
}

const fmt = (d: Delta | undefined) =>
  d === undefined
    ? '      —'
    : `${d.pct >= 0 ? '+' : ''}${d.pct.toFixed(1).padStart(5)}%${d.significant ? ' ⚠' : ''}`

// ---------------------------------------------------------------------------

const anchorRef = flag('no-anchor')
  ? undefined
  : git('describe --tags --abbrev=0')

let baseRef = opt('base') ?? git('merge-base HEAD main')
let baseLabel = opt('base') ? 'given' : 'merge-base with main'
if (!benchable(baseRef)) {
  if (!anchorRef) {
    console.error(
      `[bench] base ${baseRef} predates the vitest 5 bench harness and --no-anchor leaves no fallback; pass a newer --base.`
    )
    process.exit(1)
  }
  console.warn(
    `\x1b[33m[bench] base ${baseRef} predates the vitest 5 bench harness — using the anchor tag as base instead.\x1b[0m`
  )
  baseRef = anchorRef
  baseLabel = 'fallback: anchor tag'
}

const baseSha = git(`rev-parse --short ${baseRef}`)
const anchorSha = anchorRef ? git(`rev-parse --short ${anchorRef}`) : undefined

console.log(`[bench] head:   ${git('rev-parse --short HEAD')} (current tree)`)
console.log(`[bench] base:   ${baseSha} (${baseLabel})`)
if (anchorRef) console.log(`[bench] anchor: ${anchorRef} (latest tag)`)

const headJson = runLeg('head', repoRoot, true)
const baseJson = runLeg('base', prepareWorktree(baseRef), false)
// Same commit → same numbers; don't run the leg twice.
const anchorJson =
  anchorRef === undefined
    ? undefined
    : anchorSha === baseSha
      ? baseJson
      : runLeg('anchor', prepareWorktree(anchorRef), false)

const head = parseBenchJson(headJson)
const base = parseBenchJson(baseJson)
const anchor = anchorJson ? parseBenchJson(anchorJson) : undefined

let regressions = 0
console.log(
  `\n${'bench'.padEnd(64)} ${'head ms'.padStart(9)} ${'vs base'.padStart(8)} ${'vs anchor'.padStart(9)}`
)
for (const [name, h] of head) {
  const b = base.get(name)
  const a = anchor?.get(name)
  const db = b ? delta(h, b) : undefined
  const da = a ? delta(h, a) : undefined
  if (db?.significant || da?.significant) regressions++
  console.log(
    `${name.slice(0, 64).padEnd(64)} ${h.mean.toFixed(3).padStart(9)} ${fmt(db)} ${fmt(da)}`
  )
}
for (const name of base.keys()) {
  if (!head.has(name))
    console.log(`${name.slice(0, 64).padEnd(64)}   (removed)`)
}

if (!keep) {
  cleanupWorktree(baseRef)
  if (anchorRef) cleanupWorktree(anchorRef)
}

if (regressions > 0) {
  console.error(
    `\n\x1b[31m✗ ${regressions} bench(es) regressed beyond ${thresholdPct}% (+ significance floor)\x1b[0m`
  )
  if (failOnRegression) process.exit(1)
} else {
  console.log(`\n\x1b[32m✓ no significant regressions\x1b[0m`)
}
