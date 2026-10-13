/**
 * The shared live-row runner GUI (the test runner's display generalized):
 * one row per step with a spinner while running, then a green ✓ / red ✗ with
 * an optional status text (issue counts, item counts, live progress). Rows
 * run sequentially (vp handles the real parallelism and caching inside each
 * step), or a single `driver` process feeds many rows (pack). All captured
 * output goes to `.vueform/<scope>/logs/<stamp>.log`, failing rows' output
 * additionally to `<stamp>.errors.log`, and the run ends with a link when
 * there is anything to look at. Non-TTY runs print each row as it finishes.
 *
 * Steps that wrap `vpr`/`vp run` keep full vite-plus caching — a warm row
 * completes instantly.
 */
import { spawn } from 'node:child_process'
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

export const ansiRe = new RegExp(String.raw`\x1b\[[0-9;]*m`, 'g')

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

export interface GuiRow {
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

export interface GuiDriver {
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

export interface GuiOptions {
  title: string
  /**
   * State directory under `.vueform` (`<scope>/logs`).
   */
  scope: string
  rows: GuiRow[]
  /**
   * One process feeding every row (pack) instead of one process per row.
   */
  driver?: GuiDriver
  /**
   * Run every row even after a failure (fix).
   */
  keepGoing?: boolean
  /**
   * Trailing lines printed under the summary (log links are automatic).
   */
  epilogue?: () => string | undefined
}

interface RowState {
  status: 'pending' | 'running' | 'pass' | 'fail'
  startedAt: number
  elapsed: string
  cached: boolean
  progress: string
  detail: string
  issues: number
  output: string
}

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

export async function runGui(opts: GuiOptions): Promise<boolean> {
  const runStarted = Date.now()
  const logsDir = path.join(repoRoot, '.vueform', opts.scope, 'logs')
  fs.mkdirSync(logsDir, { recursive: true })

  // Prune by session stamp (a run writes up to two files per stamp).
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
      if (file.startsWith(`${old}.`))
        fs.rmSync(path.join(logsDir, file), { force: true })
    }
  }

  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\..+/, '')
    .replace('T', '-')
  const logFile = path.join(logsDir, `${stamp}.log`)
  const errorsFile = path.join(logsDir, `${stamp}.errors.log`)
  const logFd = fs.openSync(logFile, 'w')

  const states = new Map<string, RowState>(
    opts.rows.map(({ name }) => [
      name,
      {
        status: 'pending',
        startedAt: 0,
        elapsed: '',
        cached: false,
        progress: '',
        detail: '',
        issues: 0,
        output: '',
      },
    ])
  )

  const nameWidth = Math.max(...opts.rows.map(({ name }) => name.length)) + 2
  let tick = 0
  let printedLines = 0

  const rowText = (name: string, state: RowState, spin: string): string => {
    const mark =
      state.status === 'running'
        ? cyan(spin)
        : state.status === 'pending'
          ? dim('·')
          : state.status === 'pass'
            ? green('✓')
            : red('✗')
    const liveSeconds = `${((Date.now() - state.startedAt) / 1000).toFixed(1)}s`
    // Finished rows append their final time (and cache mark) to any status
    // text; running rows append the live counter to any progress text.
    const suffix =
      (state.detail && state.elapsed ? dim(` · ${state.elapsed}`) : '') +
      (state.cached ? dim(' (from cache)') : '')
    const detail =
      state.status === 'running'
        ? dim(
            state.progress ? `${state.progress} · ${liveSeconds}` : liveSeconds
          )
        : state.status === 'pass'
          ? (state.issues > 0
              ? yellow(state.detail)
              : green(state.detail || state.elapsed)) + suffix
          : state.status === 'fail'
            ? red(state.detail || 'failed') +
              (state.elapsed ? dim(` · ${state.elapsed}`) : '')
            : ''
    return `  ${mark} ${name.padEnd(nameWidth)}${detail}`
  }

  const repaint = () => {
    const spin = SPINNER[tick % SPINNER.length]
    const lines = [
      bold(opts.title),
      ...opts.rows.map(({ name }) => rowText(name, states.get(name)!, spin)),
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
  } else console.log(bold(opts.title))
  const restoreCursor = () => {
    if (live) process.stdout.write('\x1b[?25h')
  }
  process.on('exit', restoreCursor)

  const isCached = (output: string) =>
    /cache hit/.test(output) && !/cache miss/.test(output)

  const finishRow = (row: GuiRow, code: number) => {
    const state = states.get(row.name)!
    state.cached = isCached(state.output)
    if (state.startedAt > 0)
      state.elapsed = `${((Date.now() - state.startedAt) / 1000).toFixed(1)}s`
    const result = row.summarize?.(state.output.replace(ansiRe, ''), code)
    state.detail = result?.detail ?? ''
    state.issues = result?.issues ?? 0
    state.status = (result?.fail ?? code !== 0) ? 'fail' : 'pass'
    fs.writeSync(logFd, `\n––––– ${row.name} –––––\n`)
    fs.writeSync(
      logFd,
      state.output.endsWith('\n') ? state.output : state.output + '\n'
    )
    if (live) repaint()
    else if (verbose) {
      console.log(`\n––––– ${row.name} –––––\n`)
      console.log(state.output.trimEnd())
    } else console.log(rowText(row.name, state, ''))
  }

  const runChild = (
    cmd: string,
    args: string[],
    onLine: (plain: string, raw: string) => void
  ): Promise<number> =>
    new Promise((resolve) => {
      const child = spawn(cmd, args, {
        cwd: repoRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: process.platform !== 'win32',
        env: { ...process.env, FORCE_COLOR: '0' },
      })
      activeChildren.add(child)
      for (const stream of [child.stdout, child.stderr]) {
        const rl = readline.createInterface({ input: stream })
        rl.on('line', (line) => onLine(line.replace(ansiRe, ''), line))
      }
      child.on('close', (code) => {
        activeChildren.delete(child)
        resolve(code ?? 1)
      })
    })

  let failedEarly = false

  if (opts.driver) {
    // One process, many rows: `route` flips rows by name as lines arrive.
    const pending = opts.rows.map(({ name }) => name)
    const api = {
      running: (name: string) => {
        const state = states.get(name)
        if (state && state.status === 'pending') {
          state.status = 'running'
          state.startedAt = Date.now()
        }
      },
      done: (name: string) => {
        const state = states.get(name)
        if (state && state.status !== 'pass') {
          if (state.startedAt > 0)
            state.elapsed = `${((Date.now() - state.startedAt) / 1000).toFixed(1)}s`
          state.status = 'pass'
          if (live) repaint()
          else console.log(rowText(name, state, ''))
        }
      },
      fail: (name: string) => {
        const state = states.get(name)
        if (state && state.status !== 'fail') {
          if (state.startedAt > 0)
            state.elapsed = `${((Date.now() - state.startedAt) / 1000).toFixed(1)}s`
          state.status = 'fail'
          if (live) repaint()
          else console.log(rowText(name, state, ''))
        }
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
    fs.writeSync(logFd, output)
    const cached = isCached(output.replace(ansiRe, ''))
    for (const name of pending) {
      const state = states.get(name)!
      state.cached = cached
      if (code === 0) {
        if (state.status !== 'pass') {
          state.status = 'pass'
          if (!live) console.log(rowText(name, state, ''))
        }
      } else if (state.status !== 'pass') {
        state.status = 'fail'
        state.output = output
        if (!live) console.log(rowText(name, state, ''))
      }
    }
    if (live) repaint()
  } else {
    for (const row of opts.rows) {
      const state = states.get(row.name)!
      state.status = 'running'
      state.startedAt = Date.now()
      if (live) repaint()
      const code = await runChild(row.cmd!, row.args ?? [], (plain, raw) => {
        state.output += raw + '\n'
        row.onLine?.(plain, (text) => {
          state.progress = text
        })
      })
      finishRow(row, code)
      // Fresh read: `finishRow` mutates the status behind TS's narrowing.
      if (states.get(row.name)!.status === 'fail' && !opts.keepGoing) {
        failedEarly = true
        break
      }
    }
  }

  if (timer) clearInterval(timer)
  if (live) repaint()
  restoreCursor()
  process.removeListener('exit', restoreCursor)
  fs.closeSync(logFd)

  const failures = opts.rows.filter(
    ({ name }) => states.get(name)!.status === 'fail'
  )
  const skipped = failedEarly
    ? opts.rows.filter(({ name }) => states.get(name)!.status === 'pending')
    : []

  if (failures.length) {
    const sections = failures.map(({ name }) => {
      const output = states.get(name)!.output.replace(ansiRe, '').trimEnd()
      return `––––– ${name} –––––\n\n${output}`
    })
    fs.writeFileSync(errorsFile, sections.join('\n\n') + '\n')
  }

  const totalElapsed = `${((Date.now() - runStarted) / 1000).toFixed(1)}s`
  const status = failures.length
    ? red(
        `${failures.length} of ${opts.rows.length} steps failed in ${totalElapsed}.` +
          (skipped.length ? ` ${skipped.length} skipped.` : '')
      )
    : green(`All steps passed in ${totalElapsed}.`)
  console.log(`\n${status}`)

  if (failures.length) {
    console.log(`\n${red('See the error log:')}\n${termLink(errorsFile)}`)
  }
  const extra = opts.epilogue?.()
  if (extra) console.log(`\n${extra}`)
  console.log('')

  return failures.length === 0
}

/**
 * Shared status parsers for lint/format/typecheck outputs.
 */
export function countLintIssues(output: string): number {
  let issues = 0
  // oxlint: `Found W warnings and E errors.`
  for (const match of output.matchAll(
    /Found (\d+) warnings? and (\d+) errors?/g
  )) {
    issues += Number(match[1]) + Number(match[2])
  }
  // stylelint/eslint stylish: `✖ N problems (…)`
  for (const match of output.matchAll(/✖ (\d+) problems?/g)) {
    issues += Number(match[1])
  }
  return issues
}

export function countFormatIssues(output: string): number {
  let issues = 0
  for (const line of output.split('\n')) {
    // `vp fmt --check` lists each unformatted file as `path (Xms)`; oxfmt's
    // own check mode prints `[warn] path` / `[error] …` lines.
    if (/^\S+ \(\d+ms\)$/.test(line)) issues++
    if (/^\[warn\] /.test(line) && !/Code style issues/.test(line)) issues++
    if (/^\[error\]/.test(line)) issues++
  }
  return issues
}

export function countTsErrors(output: string): number {
  return (output.match(/error TS\d+/g) ?? []).length
}

export const issuesDetail = (issues: number): RowResult =>
  issues > 0
    ? { detail: `${issues} issue${issues === 1 ? '' : 's'}`, issues }
    : {}
