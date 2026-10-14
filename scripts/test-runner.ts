/**
 * The shared root test-runner implementation (used by `scripts/test.ts` and
 * `scripts/test-dts.ts`): runs the given script of every package that has it
 * in parallel with a live per-package status line — spinner while running,
 * then green "N tests passed" or red "N tests failed", plus a yellow "N
 * warns" when the run captured Vue warnings. All original vitest output is
 * written to `.vueform/<scope>/logs/<stamp>.log` (one section per package),
 * mirroring the smoke runner's log; the run ends with a link to it.
 * `--verbose` dumps each package's original output instead of the rows;
 * `--ci` forces plain completion lines on a TTY.
 *
 * Counts come from vitest's JSON reporter (written to a scratch file per
 * package) while the verbose reporter's stream feeds the log, so the log
 * stays the faithful original output.
 *
 * Besides the full session log, the run distills two sibling files when
 * there is anything to put in them: `<stamp>.warns.log` (every unique Vue
 * warn with its component stack, occurrence count and origins, per package)
 * and `<stamp>.errors.log` (every failed test with its failure messages).
 *
 * Imports `./terminal` (utils' dist) statically — the entry points call
 * `ensureUtilsDist()` and only then import this module dynamically.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

import {
  createPaint,
  createRows,
  createRunLog,
  resolveTerminalMode,
  stripAnsi,
  termLink,
  trackChild,
  untrackChild,
  type LogSection,
} from './terminal'

const repoRoot = path.resolve(
  fileURLToPath(new URL('.', import.meta.url)),
  '..'
)

const mode = resolveTerminalMode()
const { green, red, yellow } = createPaint(mode.colors)

// --update-snapshots[=mode]: forwarded to Playwright suites only (visual
// re-baselining); vitest children never receive it.
const updateSnapshots = process.argv.find((arg) =>
  /^--update-snapshots(=.+)?$/.test(arg)
)

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
  warns: Map<string, WarnEntry>
  /**
   * Failed tests, formatted as `fullName` + failure messages.
   */
  errors: string[]
  output: string
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

  fs.rmSync(resultsDir, { recursive: true, force: true })
  fs.mkdirSync(resultsDir, { recursive: true })

  // Log files (synchronous writes — the tail must survive process.exit).
  const log = createRunLog({
    dir: path.join(stateDir, 'logs'),
    mainLog: (opts.logs ?? 'full') === 'full',
  })

  // ---------------------------------------------------------------------------
  // Display: one row per package, all running from the start (the packages
  // run in parallel).

  const states = new Map<string, PkgState>(
    packages.map(({ name }) => [
      name,
      {
        warns: new Map(),
        errors: [],
        output: '',
        failed: false,
        failedTests: 0,
        done: 0,
      },
    ])
  )

  const display = createRows({
    title: opts.title,
    rows: packages.map(({ name }) => ({ id: name, status: 'active' })),
    mode,
  })
  for (const { name } of packages) {
    display.progress(name, `0/${totals[name] ?? '?'}`)
  }

  // ---------------------------------------------------------------------------
  // Warn/error distillation from the captured output and JSON reports.

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
    const lines = stripAnsi(output).split('\n')
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
        const messages = stripAnsi((test.failureMessages ?? []).join('\n'))
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
        const messages = stripAnsi(
          (spec.tests ?? [])
            .flatMap((test: any) => test.results ?? [])
            .flatMap((result: any) =>
              (result.errors ?? (result.error ? [result.error] : [])).map(
                (error: any) => String(error.message ?? error)
              )
            )
            .join('\n')
        )
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
        ? [
            '--filter',
            pkg.name,
            'run',
            opts.script,
            '--reporter=list,json',
            ...(updateSnapshots ? [updateSnapshots] : []),
          ]
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
      trackChild(child)

      const state = states.get(pkg.name)!
      // Per-test lines: vitest's verbose reporter prints `✓ file > test`,
      // playwright's list reporter `✓  12 [project] › file › test`.
      const testLineRe = playwright ? /^\s*[✓✘✗×-]\s+\d+\s/ : /^\s*[✓✗×] .* > /
      const rl = readline.createInterface({ input: child.stdout })
      rl.on('line', (line) => {
        state.output += line + '\n'
        const plain = stripAnsi(line)
        // Playwright announces its total upfront — a first run gets a real
        // denominator instead of `?`.
        if (playwright) {
          const total = plain.match(/^Running (\d+) test/)
          if (total) totals[pkg.name] = Number(total[1])
        }
        if (testLineRe.test(plain)) state.done++
        display.progress(pkg.name, `${state.done}/${totals[pkg.name] ?? '?'}`)
      })
      child.stderr.on('data', (chunk: Buffer) => {
        state.output += chunk.toString()
      })

      child.on('close', (code) => {
        untrackChild(child)
        if (!playwright) state.warns = extractWarns(state.output, pkg.dir)

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

        log.section(pkg.name)
        log.write(state.output)

        if (code === 0 && failed === 0) {
          display.pass(pkg.name, `${passed} tests passed`, {
            warns: state.warns.size,
          })
        } else {
          state.failed = true
          state.failedTests = failed
          display.fail(
            pkg.name,
            failed
              ? `${failed} tests failed${passed ? ` (${passed} passed)` : ''}`
              : `exited with ${code}`,
            { warns: state.warns.size }
          )
          if (!state.errors.length) {
            state.errors = [
              `(no JSON results — the run died before the reporter; see the full log)`,
            ]
          }
        }

        if (mode.verbose) {
          console.log(`\n––––– ${pkg.name} –––––\n`)
          console.log(state.output.trimEnd())
        }

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

  display.finish()
  log.close()

  const failures = packages.filter(({ name }) => states.get(name)!.failed)
  const totalWarns = packages.reduce(
    (sum, { name }) => sum + states.get(name)!.warns.size,
    0
  )

  // The distilled sibling logs, only when there is something to hold.
  const warnSections: LogSection[] = packages.flatMap(({ name }) => {
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
    return [{ name, body: blocks.join('\n\n') }]
  })
  const warnsFile = log.writeWarns(warnSections)
  const errorsFile = log.writeErrors(
    failures.map(({ name }) => ({
      name,
      body: states.get(name)!.errors.join('\n\n'),
    }))
  )

  // Summary: status line, then a two-line block per log file.
  const totalElapsed = `${((Date.now() - runStarted) / 1000).toFixed(1)}s`
  const status = failures.length
    ? red(
        `${failures.length} of ${packages.length} packages failed in ${totalElapsed}.`
      )
    : green(`All packages passed in ${totalElapsed}.`)
  console.log(`\n${status}`)

  if (errorsFile) {
    const failedTests = packages.reduce(
      (sum, { name }) => sum + states.get(name)!.failedTests,
      0
    )
    console.log(
      `\n${red(`${failedTests} tests failed - see full error log:`)}\n${termLink(errorsFile, mode)}`
    )
  }
  if (warnsFile) {
    console.log(
      `\n${yellow(`${totalWarns} unique warns - see full warn log:`)}\n${termLink(warnsFile, mode)}`
    )
  }
  console.log('')

  if (failures.length) process.exit(1)
}
