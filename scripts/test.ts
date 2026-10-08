/**
 * Root test runner (`pnpm test` → `vpr :test`): runs every package's plain
 * `test` script in parallel with a live per-package status line — spinner
 * while running, then green "N tests passed" or red "N tests failed", plus a
 * yellow "N warns" when the run captured Vue warnings. All original vitest
 * output is written to `.vueform/tests/logs/<stamp>.log` (one section per
 * package), mirroring the smoke runner's log; the run ends with a link to
 * it.
 *
 * Counts come from vitest's JSON reporter (written to a scratch file per
 * package) while the verbose reporter's stream feeds the log, so the log
 * stays the faithful original output.
 *
 * Besides the full session log, the run distills two sibling files when
 * there is anything to put in them: `<stamp>.warns.log` (every unique Vue
 * warn with its component stack and occurrence count, per package) and
 * `<stamp>.errors.log` (every failed test with its failure messages).
 */
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(
  fileURLToPath(new URL('.', import.meta.url)),
  '..'
)
const stateDir = path.join(repoRoot, '.vueform', 'tests')
const logsDir = path.join(stateDir, 'logs')
const resultsDir = path.join(stateDir, 'results')

const KEPT_LOGS = 20
const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

// --verbose: dump each package's original vitest output (grouped, printed as
// each package finishes) instead of the live status rows.
const verbose = process.argv.includes('--verbose')
const live = Boolean(process.stdout.isTTY) && !verbose
const colors = live && !('NO_COLOR' in process.env)
const paint = (code: string, text: string) =>
  colors ? `\x1b[${code}m${text}\x1b[0m` : text
const green = (t: string) => paint('32', t)
const red = (t: string) => paint('31', t)
const yellow = (t: string) => paint('33', t)
const cyan = (t: string) => paint('36', t)
const dim = (t: string) => paint('2', t)
const bold = (t: string) => paint('1', t)

const termLink = (file: string) =>
  live ? `\x1b]8;;file://${file}\x1b\\${file}\x1b]8;;\x1b\\` : file

interface Pkg {
  dir: string
  name: string
}

interface WarnEntry {
  count: number
  /**
   * The first occurrence's full block (message + component stack).
   */
  block: string
  /**
   * Origins (`file > test`) of the first few occurrences, from vitest's
   * captured-console block headers.
   */
  origins: string[]
}

interface PkgState {
  status: 'running' | 'pass' | 'fail'
  detail: string
  warns: Map<string, WarnEntry>
  /**
   * Failed tests, formatted as `fullName` + failure messages.
   */
  errors: string[]
  failed: boolean
  failedTests: number
}

const packages: Pkg[] = fs
  .readdirSync(path.join(repoRoot, 'packages'))
  .flatMap((dir) => {
    const manifest = path.join(repoRoot, 'packages', dir, 'package.json')
    if (!fs.existsSync(manifest)) return []
    const pkg = JSON.parse(fs.readFileSync(manifest, 'utf8'))
    return pkg.scripts?.test ? [{ dir, name: pkg.name as string }] : []
  })

// ---------------------------------------------------------------------------
// Tests run source through the vitest factory, which lives in utils' DIST —
// make sure it is current. Invoked here (vp-cached, instant on a warm hit)
// rather than as a vp dependsOn, so `pnpm test` keeps the real TTY and the
// live display below works.

const build = spawnSync('pnpm', ['exec', 'vpr', ':build:utils'], {
  cwd: repoRoot,
  encoding: 'utf8',
})
if (build.status !== 0) {
  console.error(build.stdout + build.stderr)
  process.exit(build.status ?? 1)
}

// ---------------------------------------------------------------------------
// Log file (synchronous writes — the tail must survive process.exit).

fs.mkdirSync(logsDir, { recursive: true })
fs.rmSync(resultsDir, { recursive: true, force: true })
fs.mkdirSync(resultsDir, { recursive: true })

// Prune by session: a run writes up to three files sharing a stamp prefix.
const stamps = [
  ...new Set(
    fs
      .readdirSync(logsDir)
      .filter((f) => f.endsWith('.log'))
      .map((f) => f.split('.')[0])
  ),
].sort()
for (const old of stamps.slice(0, -KEPT_LOGS + 1)) {
  for (const file of fs.readdirSync(logsDir)) {
    if (file.startsWith(`${old}.`)) {
      fs.rmSync(path.join(logsDir, file), { force: true })
    }
  }
}

const stamp = new Date()
  .toISOString()
  .replace(/[-:]/g, '')
  .replace(/\..+/, '')
  .replace('T', '-')
const logFile = path.join(logsDir, `${stamp}.log`)
const warnsFile = path.join(logsDir, `${stamp}.warns.log`)
const errorsFile = path.join(logsDir, `${stamp}.errors.log`)
const logFd = fs.openSync(logFile, 'w')

// ---------------------------------------------------------------------------
// Display: one row per package.

const states = new Map<string, PkgState>(
  packages.map(({ name }) => [
    name,
    {
      status: 'running',
      detail: '',
      warns: new Map(),
      errors: [],
      failed: false,
      failedTests: 0,
    },
  ])
)

const nameWidth = Math.max(...packages.map(({ name }) => name.length)) + 2
let tick = 0
let printedLines = 0

const rowText = (name: string, state: PkgState, spin: string): string => {
  const mark =
    state.status === 'running'
      ? cyan(spin)
      : state.status === 'pass'
        ? green('✓')
        : red('✗')
  const detail =
    state.status === 'running'
      ? dim('running…')
      : state.status === 'pass'
        ? green(state.detail)
        : red(state.detail)
  const warns =
    state.warns.size > 0 ? yellow(` · ${state.warns.size} warns`) : ''
  return `  ${mark} ${name.padEnd(nameWidth)}${detail}${warns}`
}

const repaint = () => {
  const spin = SPINNER[tick % SPINNER.length]
  const lines = [
    bold('Tests'),
    ...packages.map(({ name }) => rowText(name, states.get(name)!, spin)),
  ]
  let out = ''
  if (printedLines > 0) out += `\x1b[${printedLines}A`
  for (const line of lines) out += `\x1b[2K${line}\n`
  process.stdout.write(out)
  printedLines = lines.length
}

let timer: ReturnType<typeof setInterval> | undefined
if (live) {
  process.stdout.write('\x1b[?25l')
  timer = setInterval(() => {
    tick++
    repaint()
  }, 100)
  repaint()
}
const restoreCursor = () => {
  if (live) process.stdout.write('\x1b[?25h')
}
process.on('exit', restoreCursor)

// ---------------------------------------------------------------------------
// Run every package's `test` script in parallel.

const ansiRe = new RegExp(String.raw`\x1b\[[0-9;]*m`, 'g')

const BLOCK_END = /^(stdout|stderr) \||^\s*$|^ *[✓✗❯·]/
const MAX_BLOCK_LINES = 30
const SHOWN_ORIGINS = 5

/**
 * Unique Vue warns in a run's output, keyed by the message's first line,
 * each carrying its occurrence count, the first occurrence's full block
 * (message + the component stack that follows it), and the origins
 * (`file > test`, from vitest's captured-console headers) of the first
 * occurrences.
 */
function extractWarns(output: string, pkgDir: string): Map<string, WarnEntry> {
  const warns = new Map<string, WarnEntry>()
  const lines = output.replace(ansiRe, '').split('\n')
  let origin = '(unknown origin)'

  for (let i = 0; i < lines.length; i++) {
    const header = lines[i].match(/^(stdout|stderr) \| (.+)$/)
    if (header) {
      // `file > test…` — absolutize the file as a file:// URI so editors
      // linkify it when the warns log is opened (plain relative paths are
      // not clickable in an editor view).
      const [file, ...test] = header[2].split(' > ')
      const abs = path.isAbsolute(file)
        ? file
        : path.join(repoRoot, 'packages', pkgDir, file)
      origin = `file://${abs}${test.length ? ` > ${test.join(' > ')}` : ''}`
      continue
    }

    const match = lines[i].match(/\[Vue warn\]: (.*)/)
    if (!match) continue

    const message = match[1].trim()
    const existing = warns.get(message)
    if (existing) {
      existing.count++
      if (existing.origins.length < SHOWN_ORIGINS) {
        existing.origins.push(origin)
      }
      continue
    }

    const block = [`[Vue warn]: ${message}`]
    for (
      let j = i + 1;
      j < lines.length && block.length < MAX_BLOCK_LINES;
      j++
    ) {
      if (BLOCK_END.test(lines[j]) || lines[j].includes('[Vue warn]')) break
      block.push(lines[j])
    }
    warns.set(message, {
      count: 1,
      block: block.join('\n').trimEnd(),
      origins: [origin],
    })
  }

  return warns
}

/**
 * Failed tests from vitest's JSON results: full test name plus its failure
 * messages.
 */
function extractErrors(data: any): string[] {
  const errors: string[] = []
  for (const file of data?.testResults ?? []) {
    for (const test of file.assertionResults ?? []) {
      if (test.status !== 'failed') continue
      const messages = (test.failureMessages ?? [])
        .join('\n')
        .replace(ansiRe, '')
      errors.push(`✗ ${test.fullName}\n${messages.replace(/^/gm, '  ')}`)
    }
  }
  return errors
}

function runPackage(pkg: Pkg): Promise<void> {
  return new Promise((resolve) => {
    const jsonFile = path.join(resultsDir, `${pkg.dir}.json`)
    const child = spawn(
      'pnpm',
      [
        '--filter',
        pkg.name,
        'run',
        'test',
        '--run',
        '--reporter=verbose',
        '--reporter=json',
        `--outputFile=${jsonFile}`,
      ],
      { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'] }
    )

    let output = ''
    child.stdout.on('data', (chunk: Buffer) => (output += chunk.toString()))
    child.stderr.on('data', (chunk: Buffer) => (output += chunk.toString()))

    child.on('close', (code) => {
      const state = states.get(pkg.name)!
      state.warns = extractWarns(output, pkg.dir)

      let passed = 0
      let failed = 0
      try {
        const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'))
        passed = data.numPassedTests ?? 0
        failed = data.numFailedTests ?? 0
        state.errors = extractErrors(data)
      } catch {
        // No/invalid JSON (e.g. the process died before the reporter ran) —
        // fall through to the exit code.
      }

      if (code === 0 && failed === 0) {
        state.status = 'pass'
        state.detail = `${passed} tests passed`
      } else {
        state.status = 'fail'
        state.failed = true
        state.failedTests = failed
        state.detail = failed
          ? `${failed} tests failed${passed ? ` (${passed} passed)` : ''}`
          : `exited with ${code}`
        if (!state.errors.length) {
          state.errors = [
            `(no JSON results — the run died before the reporter; see the full log)`,
          ]
        }
      }

      fs.writeSync(logFd, `\n––––– ${pkg.name} –––––\n`)
      fs.writeSync(logFd, output.endsWith('\n') ? output : output + '\n')

      if (live) repaint()
      else if (verbose) {
        console.log(`\n––––– ${pkg.name} –––––\n`)
        console.log(output.trimEnd())
      } else console.log(rowText(pkg.name, state, ''))

      resolve()
    })
  })
}

async function main() {
  await Promise.all(packages.map(runPackage))

  if (timer) clearInterval(timer)
  if (live) repaint()
  restoreCursor()
  process.removeListener('exit', restoreCursor)
  fs.closeSync(logFd)

  const failures = packages.filter(({ name }) => states.get(name)!.failed)
  const totalWarns = packages.reduce(
    (sum, { name }) => sum + states.get(name)!.warns.size,
    0
  )

  // The distilled sibling logs, only when there is something to hold.
  if (totalWarns > 0) {
    const sections = packages.flatMap(({ name }) => {
      const warns = states.get(name)!.warns
      if (!warns.size) return []
      const blocks = [...warns.values()].map((warn) => {
        // Origins of the first occurrences (deduped), then the remainder as
        // a count.
        const origins = [...new Set(warn.origins)].map((o) => `  ↳ ${o}`)
        const more =
          warn.count > SHOWN_ORIGINS
            ? [`  +${warn.count - SHOWN_ORIGINS} occurrences`]
            : []
        return [`×${warn.count}  ${warn.block}`, ...origins, ...more].join('\n')
      })
      return [`––––– ${name} –––––\n\n${blocks.join('\n\n')}`]
    })
    fs.writeFileSync(warnsFile, sections.join('\n\n') + '\n')
  }
  if (failures.length) {
    const sections = failures.map(({ name }) => {
      const errors = states.get(name)!.errors
      return `––––– ${name} –––––\n\n${errors.join('\n\n')}`
    })
    fs.writeFileSync(errorsFile, sections.join('\n\n') + '\n')
  }

  // Summary: status line, then a two-line block per log file.
  const status = failures.length
    ? red(`${failures.length} of ${packages.length} packages failed.`)
    : green('All packages passed.')
  console.log(`\n${status}`)

  if (failures.length) {
    const failedTests = packages.reduce(
      (sum, { name }) => sum + states.get(name)!.failedTests,
      0
    )
    console.log(
      `\n${red(`${failedTests} tests failed - see full error log:`)}\n${termLink(errorsFile)}`
    )
  }
  if (totalWarns > 0) {
    console.log(
      `\n${yellow(`${totalWarns} unique warns - see full warn log:`)}\n${termLink(warnsFile)}`
    )
  }
  console.log(`\nSee full log:\n${termLink(logFile)}\n`)

  if (failures.length) process.exit(1)
}

void main()
