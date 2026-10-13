/**
 * The shared root test-runner implementation (used by `scripts/test.ts` and
 * `scripts/test-dts.ts`): runs the given script of every package that has it
 * in parallel with a live per-package status line — spinner while running,
 * then green "N tests passed" or red "N tests failed", plus a yellow "N
 * warns" when the run captured Vue warnings. All original vitest output is
 * written to `.vueform/<scope>/logs/<stamp>.log` (one section per package),
 * mirroring the smoke runner's log; the run ends with a link to it.
 * `--verbose` dumps each package's original output instead of the rows.
 *
 * Counts come from vitest's JSON reporter (written to a scratch file per
 * package) while the verbose reporter's stream feeds the log, so the log
 * stays the faithful original output.
 *
 * Besides the full session log, the run distills two sibling files when
 * there is anything to put in them: `<stamp>.warns.log` (every unique Vue
 * warn with its component stack, occurrence count and origins, per package)
 * and `<stamp>.errors.log` (every failed test with its failure messages).
 */
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(
  fileURLToPath(new URL('.', import.meta.url)),
  '..'
)

const KEPT_LOGS = 20
const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

// On POSIX the per-package children run detached (own process groups), and
// Ctrl-C is handled here: every live group is killed (vitest workers and
// browser processes included) before exiting. Without this, an interrupted
// run leaves test workers behind.
const activeChildren = new Set<ReturnType<typeof spawn>>()
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    for (const child of activeChildren) {
      if (!child.pid) continue
      try {
        if (process.platform === 'win32') child.kill()
        else process.kill(-child.pid, 'SIGTERM')
      } catch {
        // Already gone.
      }
    }
    process.stdout.write('\x1b[?25h')
    process.exit(signal === 'SIGINT' ? 130 : 143)
  })
}

// --verbose: dump each package's original vitest output (grouped, printed as
// each package finishes) instead of the live status rows.
const verbose = process.argv.includes('--verbose')
const live = Boolean(process.stdout.isTTY) && !verbose

// --filter <pkg> / -F / -f: run only that one package (by package name, dir
// name, or bare name without the @vueform/ scope).
function parseFilter(): string | undefined {
  const argv = process.argv.slice(2)
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--filter' || arg === '-F' || arg === '-f') return argv[i + 1]
    const match = arg.match(/^(?:--filter|-F|-f)=(.*)$/)
    if (match) return match[1]
  }
  return undefined
}
const filter = parseFilter()

export interface TestRunnerOptions {
  /**
   * The per-package script to run (`test`, `test-dts`).
   */
  script: string
  /**
   * State directory under `.vueform` (logs + JSON scratch files).
   */
  scope: string
  /**
   * The live display's heading.
   */
  title: string
  /**
   * The tool behind the script: vitest (default) appends its reporter flags
   * and extracts Vue warns; playwright reports via PLAYWRIGHT_JSON_OUTPUT_NAME
   * and has no warn pass.
   */
  kind?: 'vitest' | 'playwright'
  /**
   * 'errors-only' writes no full session log and no warns file — only the
   * errors log when something fails (the visual suites' choice).
   */
  logs?: 'full' | 'errors-only'
}
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
  startedAt: number
  elapsed: string
  detail: string
  warns: Map<string, WarnEntry>
  /**
   * Failed tests, formatted as `fullName` + failure messages.
   */
  errors: string[]
  failed: boolean
  failedTests: number
  /**
   * Tests finished so far (counted live from the reporter's per-test lines).
   */
  done: number
}

export async function runTestRunner(opts: TestRunnerOptions): Promise<void> {
  const runStarted = Date.now()
  const stateDir = path.join(repoRoot, '.vueform', opts.scope)
  const logsDir = path.join(stateDir, 'logs')
  const resultsDir = path.join(stateDir, 'results')
  // Last run's per-package test totals — the `y` of the live `x/y` progress.
  // A first run shows `x/?` until the totals exist.
  const totalsFile = path.join(stateDir, 'totals.json')
  let totals: Record<string, number> = {}
  try {
    totals = JSON.parse(fs.readFileSync(totalsFile, 'utf8'))
  } catch {
    // No totals yet.
  }

  let packages: Pkg[] = fs
    .readdirSync(path.join(repoRoot, 'packages'))
    .flatMap((dir) => {
      const manifest = path.join(repoRoot, 'packages', dir, 'package.json')
      if (!fs.existsSync(manifest)) return []
      const pkg = JSON.parse(fs.readFileSync(manifest, 'utf8'))
      return pkg.scripts?.[opts.script]
        ? [{ dir, name: pkg.name as string }]
        : []
    })

  if (!packages.length) {
    console.error(`No package has a "${opts.script}" script.`)
    process.exit(1)
  }

  if (filter !== undefined) {
    const match = packages.find(
      ({ dir, name }) =>
        name === filter || dir === filter || name === `@vueform/${filter}`
    )
    if (!match) {
      console.error(
        `No package matching "${filter}" has a "${opts.script}" script ` +
          `(available: ${packages.map(({ dir }) => dir).join(', ')}).`
      )
      process.exit(1)
    }
    packages = [match]
  }

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
  const fullLogs = (opts.logs ?? 'full') === 'full'
  const logFd = fullLogs ? fs.openSync(logFile, 'w') : null

  // ---------------------------------------------------------------------------
  // Display: one row per package.

  const states = new Map<string, PkgState>(
    packages.map(({ name }) => [
      name,
      {
        status: 'running',
        startedAt: Date.now(),
        elapsed: '',
        detail: '',
        warns: new Map(),
        errors: [],
        failed: false,
        failedTests: 0,
        done: 0,
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
        ? dim(`${state.done}/${totals[name] ?? '?'}`)
        : state.status === 'pass'
          ? green(state.detail)
          : red(state.detail)
    const warns =
      state.warns.size > 0 ? yellow(` · ${state.warns.size} warns`) : ''
    const time =
      state.status !== 'running' && state.elapsed
        ? dim(` · ${state.elapsed}`)
        : ''
    return `  ${mark} ${name.padEnd(nameWidth)}${detail}${warns}${time}`
  }

  const repaint = () => {
    const spin = SPINNER[tick % SPINNER.length]
    const lines = [
      bold(opts.title),
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
  function extractWarns(
    output: string,
    pkgDir: string
  ): Map<string, WarnEntry> {
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

  /**
   * Failed tests from Playwright's JSON report: walk the suite tree and
   * collect each not-ok spec's title with its error messages.
   */
  function extractPlaywrightErrors(data: any): string[] {
    const errors: string[] = []
    const walk = (suite: any, trail: string[]) => {
      for (const child of suite.suites ?? []) {
        walk(child, [...trail, child.title].filter(Boolean))
      }
      for (const spec of suite.specs ?? []) {
        if (spec.ok) continue
        const messages = (spec.tests ?? [])
          .flatMap((test: any) => test.results ?? [])
          .flatMap((result: any) =>
            (result.errors ?? (result.error ? [result.error] : [])).map(
              (error: any) => String(error.message ?? error)
            )
          )
          .join('\n')
          .replace(ansiRe, '')
        errors.push(
          `✗ ${[...trail, spec.title].join(' › ')}\n${messages.replace(/^/gm, '  ')}`
        )
      }
    }
    for (const suite of data?.suites ?? [])
      walk(suite, [suite.title].filter(Boolean))
    return errors
  }

  function runPackage(pkg: Pkg): Promise<void> {
    return new Promise((resolve) => {
      const jsonFile = path.join(resultsDir, `${pkg.dir}.json`)
      const playwright = opts.kind === 'playwright'
      const args = playwright
        ? ['--filter', pkg.name, 'run', opts.script, '--reporter=list,json']
        : [
            '--filter',
            pkg.name,
            'run',
            opts.script,
            '--run',
            '--reporter=verbose',
            '--reporter=json',
            `--outputFile=${jsonFile}`,
          ]
      const child = spawn('pnpm', args, {
        cwd: repoRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: process.platform !== 'win32',
        env: playwright
          ? { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: jsonFile }
          : process.env,
      })
      activeChildren.add(child)

      let output = ''
      const state = states.get(pkg.name)!
      // Per-test lines: vitest's verbose reporter prints `✓ file > test`,
      // playwright's list reporter `✓  12 [project] › file › test`.
      const testLineRe = playwright ? /^\s*[✓✘✗×-]\s+\d+\s/ : /^\s*[✓✗×] .* > /
      const rl = readline.createInterface({ input: child.stdout })
      rl.on('line', (line) => {
        output += line + '\n'
        const plain = line.replace(ansiRe, '')
        // Playwright announces its total upfront — a first run gets a real
        // denominator instead of `?`.
        if (playwright) {
          const total = plain.match(/^Running (\d+) test/)
          if (total) totals[pkg.name] = Number(total[1])
        }
        if (testLineRe.test(plain)) state.done++
      })
      child.stderr.on('data', (chunk: Buffer) => (output += chunk.toString()))

      child.on('close', (code) => {
        activeChildren.delete(child)
        state.elapsed = `${((Date.now() - state.startedAt) / 1000).toFixed(1)}s`
        if (!playwright) state.warns = extractWarns(output, pkg.dir)

        let passed = 0
        let failed = 0
        try {
          const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'))
          if (playwright) {
            passed = (data.stats?.expected ?? 0) + (data.stats?.flaky ?? 0)
            failed = data.stats?.unexpected ?? 0
            state.errors = extractPlaywrightErrors(data)
          } else {
            passed = data.numPassedTests ?? 0
            failed = data.numFailedTests ?? 0
            state.errors = extractErrors(data)
          }
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

        if (logFd !== null) {
          fs.writeSync(logFd, `\n––––– ${pkg.name} –––––\n`)
          fs.writeSync(logFd, output.endsWith('\n') ? output : output + '\n')
        }

        if (live) repaint()
        else if (verbose) {
          console.log(`\n––––– ${pkg.name} –––––\n`)
          console.log(output.trimEnd())
        } else console.log(rowText(pkg.name, state, ''))

        resolve()
      })
    })
  }

  await Promise.all(packages.map(runPackage))

  // Remember this run's totals for the next run's `x/y` denominators.
  for (const { name } of packages) {
    const finished = states.get(name)!.done
    if (finished > 0) totals[name] = finished
  }
  try {
    fs.writeFileSync(totalsFile, JSON.stringify(totals, null, 2) + '\n')
  } catch {
    // Totals are a convenience — never fail the run over them.
  }

  if (timer) clearInterval(timer)
  if (live) repaint()
  restoreCursor()
  process.removeListener('exit', restoreCursor)
  if (logFd !== null) fs.closeSync(logFd)

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
  const totalElapsed = `${((Date.now() - runStarted) / 1000).toFixed(1)}s`
  const status = failures.length
    ? red(
        `${failures.length} of ${packages.length} packages failed in ${totalElapsed}.`
      )
    : green(`All packages passed in ${totalElapsed}.`)
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
  console.log('')

  if (failures.length) process.exit(1)
}
