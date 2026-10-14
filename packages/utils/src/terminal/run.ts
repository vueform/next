/**
 * The convenience runner over the rows display (the former `runGui`): one
 * child process per row run sequentially (vp handles the real parallelism and
 * caching inside each step), or a single `driver` process feeding many rows
 * (pack). All captured output goes to `.vueform/<scope>/logs/<stamp>.log`,
 * failing rows' output additionally to `<stamp>.errors.log`, and the run ends
 * with a link when there is anything to look at. `--verbose` dumps each row's
 * original output instead of the rows; `--ci` forces plain completion lines
 * on a TTY.
 *
 * Steps that wrap `vpr`/`vp run` keep full vite-plus caching — a warm row
 * completes instantly and carries the dim `(from cache)` mark.
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import readline from 'node:readline'

import { findWorkspaceRoot } from '../shared'
import { trackChild, untrackChild } from './cleanup'
import { createRunLog, type LogSection } from './logs'
import { resolveTerminalMode, type TerminalMode } from './mode'
import { createPaint, stripAnsi, termLink } from './paint'
import { isCached } from './parsers'
import { createRows } from './rows'

export interface RowResult {
  /**
   * Status text after the name (`3 issues`, `42 registry items built`).
   */
  detail?: string
  /**
   * Overrides the exit-code verdict (fix rows pass with fixable leftovers).
   */
  fail?: boolean
  /**
   * Issue count — rendered yellow on a passing row, red on a failing one.
   */
  issues?: number
}

export interface RunRow {
  name: string
  cmd?: string
  args?: string[]
  /**
   * Live progress text from an output line (ANSI already stripped).
   */
  onLine?: (line: string, setProgress: (text: string) => void) => void
  /**
   * Final verdict/status from the row's full output and exit code.
   */
  summarize?: (output: string, code: number) => RowResult
}

export interface RunDriver {
  cmd: string
  args: string[]
  /**
   * Routes one output line to the rows: mark a row running or done by name.
   */
  route: (
    line: string,
    api: {
      running: (name: string) => void
      done: (name: string) => void
      fail: (name: string) => void
    }
  ) => void
}

export interface RunRowsOptions {
  title: string
  /**
   * State directory under `.vueform` (`<scope>/logs`).
   */
  scope: string
  rows: RunRow[]
  /**
   * One process feeding every row (pack) instead of one process per row.
   */
  driver?: RunDriver
  /**
   * Run every row even after a failure (fix).
   */
  keepGoing?: boolean
  /**
   * Trailing lines printed under the summary (log links are automatic).
   */
  epilogue?: () => string | undefined
  /**
   * The repo root (children's cwd, `.vueform` anchor). Defaults to the pnpm
   * workspace root above the current directory.
   */
  root?: string
  mode?: TerminalMode
  /**
   * Extra child env. The default strips child colors so logs and parsed
   * output stay plain.
   */
  childEnv?: Record<string, string>
}

export async function runRows(opts: RunRowsOptions): Promise<boolean> {
  const runStarted = Date.now()
  const root = opts.root ?? findWorkspaceRoot(process.cwd())
  const mode = opts.mode ?? resolveTerminalMode()
  const { green, red } = createPaint(mode.colors)

  const log = createRunLog({
    dir: path.join(root, '.vueform', opts.scope, 'logs'),
  })

  const display = createRows({
    title: opts.title,
    rows: opts.rows.map(({ name }) => ({ id: name })),
    mode,
  })

  const outputs = new Map<string, string>(
    opts.rows.map(({ name }) => [name, ''])
  )
  const failed = new Set<string>()
  const started = new Set<string>()

  const dumpVerbose = (name: string, output: string) => {
    console.log(`\n––––– ${name} –––––\n`)
    console.log(output.trimEnd())
  }

  const runChild = (
    cmd: string,
    args: string[],
    onLine: (plain: string, raw: string) => void
  ): Promise<number> =>
    new Promise((resolve) => {
      const child = spawn(cmd, args, {
        cwd: root,
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: process.platform !== 'win32',
        env: { ...process.env, FORCE_COLOR: '0', ...opts.childEnv },
      })
      trackChild(child)
      for (const stream of [child.stdout!, child.stderr!]) {
        const rl = readline.createInterface({ input: stream })
        rl.on('line', (line) => onLine(stripAnsi(line), line))
      }
      child.on('close', (code) => {
        untrackChild(child)
        resolve(code ?? 1)
      })
    })

  let failedEarly = false

  if (opts.driver) {
    // One process, many rows: `route` flips rows by name as lines arrive.
    // The rows display defers plain printing to the caller under --verbose;
    // driver rows have no per-row output to dump, so verbose prints the row
    // lines themselves.
    const verboseLine = (name: string) => {
      if (mode.verbose) console.log(display.rowLine(name))
    }
    const api = {
      running: (name: string) => {
        started.add(name)
        display.start(name)
      },
      done: (name: string) => {
        if (display.status(name) === 'pass') return
        display.pass(name)
        verboseLine(name)
      },
      fail: (name: string) => {
        if (display.status(name) === 'fail') return
        failed.add(name)
        display.fail(name)
        verboseLine(name)
      },
    }
    let output = ''
    const code = await runChild(
      opts.driver.cmd,
      opts.driver.args,
      (plain, raw) => {
        output += raw + '\n'
        opts.driver!.route(plain, api)
      }
    )
    log.write(output)
    const cached = isCached(stripAnsi(output))
    // The settling sweep: on a full cache hit every row carries the mark, and
    // rows the route never completed are settled by the exit code.
    for (const { name } of opts.rows) {
      if (display.status(name) !== 'pass') {
        if (code === 0) {
          display.pass(name, undefined, { cached })
          verboseLine(name)
        } else {
          failed.add(name)
          outputs.set(name, output)
          display.fail(name)
          verboseLine(name)
        }
      } else if (cached) {
        display.markCached(name)
      }
    }
  } else {
    for (const row of opts.rows) {
      started.add(row.name)
      display.start(row.name)
      const code = await runChild(row.cmd!, row.args ?? [], (plain, raw) => {
        outputs.set(row.name, outputs.get(row.name)! + raw + '\n')
        row.onLine?.(plain, (text) => display.progress(row.name, text))
      })
      const output = outputs.get(row.name)!
      log.section(row.name)
      log.write(output)
      const result = row.summarize?.(stripAnsi(output), code)
      const fail = result?.fail ?? code !== 0
      if (fail) {
        failed.add(row.name)
        display.fail(row.name, result?.detail, { issues: result?.issues })
      } else {
        display.pass(row.name, result?.detail, {
          issues: result?.issues,
          cached: isCached(stripAnsi(output)),
        })
      }
      if (mode.verbose) dumpVerbose(row.name, output)
      if (fail && !opts.keepGoing) {
        failedEarly = true
        break
      }
    }
  }

  display.finish()
  log.close()

  const failures = opts.rows.filter(({ name }) => failed.has(name))
  const skipped = failedEarly
    ? opts.rows.filter(({ name }) => !started.has(name))
    : []

  const errorSections: LogSection[] = failures.map(({ name }) => ({
    name,
    body: outputs.get(name) ?? '',
  }))
  const errorsFile = log.writeErrors(errorSections)

  const totalElapsed = `${((Date.now() - runStarted) / 1000).toFixed(1)}s`
  const status = failures.length
    ? red(
        `${failures.length} of ${opts.rows.length} steps failed in ${totalElapsed}.` +
          (skipped.length ? ` ${skipped.length} skipped.` : '')
      )
    : green(`All steps passed in ${totalElapsed}.`)
  console.log(`\n${status}`)

  if (errorsFile) {
    console.log(`\n${red('See the error log:')}\n${termLink(errorsFile, mode)}`)
  }
  const extra = opts.epilogue?.()
  if (extra) console.log(`\n${extra}`)
  console.log('')

  return failures.length === 0
}
