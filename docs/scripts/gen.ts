/**
 * Docs generator runner (`pnpm gen` in docs/, `pnpm docs:gen` at the root):
 * every docs generator with the live per-task display of the api runner —
 * one row per generator, spinner and elapsed time while working, green/red
 * status when done. No logs are kept; a failed generator's captured output
 * is dumped after the run.
 *
 * Structural json extraction lives in scripts/api-extractor and writes to
 * `.vueform/api/` at the monorepo root — run `pnpm api` there first when
 * those are stale. The generators here only produce docs content from those
 * jsons.
 *
 * Ordering: generators run in parallel, except `json-types` and
 * `json-keywords`, which read pages the earlier generators write — they run
 * after the parallel group, in that order.
 */
import { spawn } from 'node:child_process'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const DOCS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
)

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

const live = Boolean(process.stdout.isTTY)
const colors = live && !('NO_COLOR' in process.env)
const paint = (code: string, text: string) =>
  colors ? `\x1b[${code}m${text}\x1b[0m` : text
const green = (t: string) => paint('32', t)
const red = (t: string) => paint('31', t)
const cyan = (t: string) => paint('36', t)
const dim = (t: string) => paint('2', t)
const bold = (t: string) => paint('1', t)

/**
 * The parallel group, then the page-reading closers in order.
 */
const PARALLEL = [
  'guide-tokens',
  'guide-locales',
  'guide-code-splitting',
  'guide-benchmark',
  'reference-composables',
  'reference-helpers',
  'reference-components',
]
const CLOSERS = ['json-types', 'json-keywords']

interface TaskState {
  status: 'pending' | 'running' | 'pass' | 'fail' | 'skipped'
  detail: string
  output: string
  startedAt: number
}

const ids = [...PARALLEL, ...CLOSERS]
const states = new Map<string, TaskState>(
  ids.map((id) => [
    id,
    { status: 'pending', detail: '', output: '', startedAt: 0 },
  ])
)

const idWidth = Math.max(...ids.map((id) => id.length)) + 2
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
    bold('Docs generators'),
    ...ids.map((id) => rowText(id, states.get(id)!, spin)),
  ]
  let out = ''
  if (printedLines > 0) out += `\x1b[${printedLines}A`
  for (const line of lines) out += `\x1b[2K${line}\n`
  process.stdout.write(out)
  printedLines = lines.length
}

function runTask(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    const state = states.get(id)!
    state.status = 'running'
    state.startedAt = Date.now()
    if (live) repaint()

    const child = spawn(
      'pnpm',
      ['exec', 'tsx', path.join(DOCS_DIR, 'scripts', 'generators', `${id}.ts`)],
      { cwd: DOCS_DIR, stdio: ['ignore', 'pipe', 'pipe'] }
    )
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

      if (live) repaint()
      else console.log(rowText(id, state, ''))

      resolve(ok)
    })
  })
}

async function main(): Promise<void> {
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

  let ok = (await Promise.all(PARALLEL.map(runTask))).every(Boolean)

  for (const id of CLOSERS) {
    if (ok) {
      ok = await runTask(id)
    } else {
      const state = states.get(id)!
      state.status = 'skipped'
      if (live) repaint()
      else console.log(rowText(id, state, ''))
    }
  }

  if (timer) clearInterval(timer)
  if (live) repaint()
  restoreCursor()
  process.removeListener('exit', restoreCursor)

  const failures = ids.filter((id) => states.get(id)!.status === 'fail')

  if (failures.length) {
    for (const id of failures) {
      console.log(`\n${dim(`––––– ${id} –––––`)}\n`)
      console.log(states.get(id)!.output.trimEnd())
    }
    console.log(
      `\n${red(`${failures.length} of ${ids.length} docs generators failed.`)}\n`
    )
    process.exit(1)
  }

  console.log(`\n${green('All docs generated.')}\n`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
