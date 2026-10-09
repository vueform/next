/**
 * API extraction runner (`pnpm api`): every scraper of
 * scripts/api-extractor plus the closing `assemble` step, with the live
 * per-task display of the root test runner — one row per target, spinner and
 * elapsed time while working, green/red status when done. All captured
 * output is written to `.vueform/api/logs/<stamp>.log` (one section per
 * task); failures are distilled into `<stamp>.errors.log` and fail the run.
 *
 * No flags, no validation, no issues tracking — those are gone pending the
 * extractor rework. The contract for now: the `.vueform/api/` jsons are
 * generated, and any error along the way is surfaced loudly.
 *
 * Ordering: scrapers run in parallel, except `features`, which waits for
 * `blueprints` (it enriches from its raw output); `assemble` runs last and
 * is skipped when any scraper failed (its inputs would be incomplete).
 */
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  collectMissingDescriptions,
  writeMissingReport,
} from './api-extractor/lib/missing'
import { FILES } from './api-extractor/lib/output'

const repoRoot = path.resolve(
  fileURLToPath(new URL('.', import.meta.url)),
  '..'
)
const extractorDir = path.join(repoRoot, 'scripts', 'api-extractor')
const KEPT_LOGS = 20
const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

const live = Boolean(process.stdout.isTTY)
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

interface ExtractTask {
  id: string
  script: string
}

interface TaskState {
  status: 'pending' | 'running' | 'pass' | 'fail' | 'skipped'
  detail: string
  /**
   * The task's full captured output (stdout + stderr, original order lost
   * across the two streams but intact within each).
   */
  output: string
  startedAt: number
}

const tasks: ExtractTask[] = [
  ...FILES.map((name) => ({
    id: name,
    script: path.join(extractorDir, 'scrapers', `${name}.ts`),
  })),
  { id: 'assemble', script: path.join(extractorDir, 'assemble.ts') },
]

async function main(): Promise<void> {
  // ---------------------------------------------------------------------------
  // The scrapers import @vueform/utils, which resolves to its DIST — make
  // sure it is current. Invoked here (vp-cached, instant on a warm hit)
  // rather than as a vp dependsOn, so `pnpm api` keeps the real TTY and
  // the live display below works.

  const build = spawnSync('pnpm', ['exec', 'vpr', ':build:utils'], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
  if (build.status !== 0) {
    console.error(build.stdout + build.stderr)
    process.exit(build.status ?? 1)
  }

  // ---------------------------------------------------------------------------
  // Log files (synchronous writes — the tail must survive process.exit).

  // Lives inside the output tree — assemble only removes its own raw files,
  // never this folder.
  const logsDir = path.join(repoRoot, '.vueform', 'api', 'logs')
  fs.mkdirSync(logsDir, { recursive: true })

  // Prune by session: a run writes up to two files sharing a stamp prefix.
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
  const errorsFile = path.join(logsDir, `${stamp}.errors.log`)
  const logFd = fs.openSync(logFile, 'w')

  // ---------------------------------------------------------------------------
  // Display: one row per task.

  const states = new Map<string, TaskState>(
    tasks.map(({ id }) => [
      id,
      { status: 'pending', detail: '', output: '', startedAt: 0 },
    ])
  )

  const idWidth = Math.max(...tasks.map(({ id }) => id.length)) + 2
  let tick = 0
  let printedLines = 0

  const elapsed = (state: TaskState) =>
    `${((Date.now() - state.startedAt) / 1000).toFixed(1)}s`

  const rowText = (id: string, state: TaskState, spin: string): string => {
    const mark =
      state.status === 'running'
        ? cyan(spin)
        : state.status === 'pass'
          ? green('✓')
          : state.status === 'fail'
            ? red('✗')
            : dim('·')
    const detail =
      state.status === 'running'
        ? dim(elapsed(state))
        : state.status === 'pass'
          ? green(state.detail)
          : state.status === 'fail'
            ? red(state.detail)
            : dim(state.status === 'skipped' ? 'skipped' : 'waiting')
    return `  ${mark} ${id.padEnd(idWidth)}${detail}`
  }

  const repaint = () => {
    const spin = SPINNER[tick % SPINNER.length]
    const lines = [
      bold('API extraction'),
      ...tasks.map(({ id }) => rowText(id, states.get(id)!, spin)),
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
  // Run the queue.

  function runTask(task: ExtractTask): Promise<boolean> {
    return new Promise((resolve) => {
      const state = states.get(task.id)!
      state.status = 'running'
      state.startedAt = Date.now()
      if (live) repaint()

      const child = spawn('pnpm', ['exec', 'tsx', task.script], {
        cwd: repoRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
      })
      child.stdout.on('data', (chunk: Buffer) => {
        state.output += chunk.toString()
      })
      child.stderr.on('data', (chunk: Buffer) => {
        state.output += chunk.toString()
      })

      child.on('close', (code) => {
        const ok = code === 0
        state.status = ok ? 'pass' : 'fail'
        state.detail = ok ? `done in ${elapsed(state)}` : `exited with ${code}`

        fs.writeSync(logFd, `\n––––– ${task.id} –––––\n`)
        fs.writeSync(
          logFd,
          state.output.endsWith('\n') || !state.output
            ? state.output
            : state.output + '\n'
        )

        if (live) repaint()
        else console.log(rowText(task.id, state, ''))

        resolve(ok)
      })
    })
  }

  const scraperRuns = new Map<string, Promise<boolean>>()
  for (const task of tasks) {
    if (task.id === 'assemble') continue
    if (task.id === 'features') {
      // Enriches from the blueprints raw output — wait for that scrape
      // (run either way: on a blueprints failure the run fails regardless).
      scraperRuns.set(
        task.id,
        scraperRuns.get('blueprints')!.then(() => runTask(task))
      )
    } else {
      scraperRuns.set(task.id, runTask(task))
    }
  }

  const scrapersOk = (await Promise.all(scraperRuns.values())).every(Boolean)

  const assembleState = states.get('assemble')!
  if (scrapersOk) {
    await runTask(tasks.find(({ id }) => id === 'assemble')!)
  } else {
    assembleState.status = 'skipped'
    if (live) repaint()
    else console.log(rowText('assemble', assembleState, ''))
  }

  if (timer) clearInterval(timer)
  if (live) repaint()
  restoreCursor()
  process.removeListener('exit', restoreCursor)
  fs.closeSync(logFd)

  // ---------------------------------------------------------------------------
  // Summary + distilled error log.

  const failures = tasks.filter(({ id }) => states.get(id)!.status === 'fail')

  if (failures.length) {
    const sections = failures.map(({ id }) => {
      const output = states.get(id)!.output.trimEnd()
      return `––––– ${id} –––––\n\n${output || '(no output)'}`
    })
    fs.writeFileSync(errorsFile, sections.join('\n\n') + '\n')

    console.log(
      `\n${red(`${failures.length} of ${tasks.length} extraction tasks failed - see full error log:`)}\n${termLink(errorsFile)}`
    )
  } else {
    console.log(`\n${green('All targets extracted.')}`)

    const missing = collectMissingDescriptions()
    const missingFile = writeMissingReport(missing)
    const total = Object.keys(missing).length

    if (total > 0) {
      console.log(
        `\n${yellow(
          `⚠ ${total} missing description${total > 1 ? 's' : ''}`
        )}${dim(' — ')}${termLink(missingFile)}`
      )
    }
  }
  console.log('')

  if (failures.length) process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
