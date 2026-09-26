/**
 * Shared machinery for the monorepo task orchestrators (`pnpm build`, `pnpm
 * check`): package discovery with `vueform.group`/`vueform.alias` metadata,
 * selector-flag parsing, and the sequential task-list renderer with per-task
 * progress bars sized by previously recorded durations.
 */
import { execFileSync, spawn } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const packagesDir = join(repoRoot, 'packages')

/**
 * Local orchestrator artifacts (recorded durations, captured messages);
 * gitignored.
 */
export const outputDir = join(repoRoot, '.output')
mkdirSync(outputDir, { recursive: true })

const isTTY = process.stdout.isTTY === true
const color = (code: string, text: string) =>
  isTTY ? `\x1b[${code}m${text}\x1b[0m` : text
// Vueform brand green (#17c495), as 24-bit truecolor.
export const green = (text: string) => color('38;2;23;196;149', text)
export const red = (text: string) => color('31', text)
export const yellow = (text: string) => color('33', text)
// White on a strong blue (#2563eb).
export const badge = (text: string) =>
  color('48;2;37;99;235;38;2;255;255;255', text)
export const dim = (text: string) => color('2', text)

export const formatSeconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`

export interface Step {
  cmd: string
  args: string[]
}

export interface Task {
  /**
   * Selector and display name, e.g. `core` or `root`.
   */
  id: string
  /**
   * Display label when it should differ from the id (e.g. `check core` in a
   * combined queue).
   */
  label?: string
  /**
   * Key under which the task's duration is recorded, e.g. `@vueform/core`.
   */
  timeKey: string
  /**
   * Duration namespace override, so combined queues (verify) reuse the times
   * recorded by the single-purpose orchestrators.
   */
  timeScope?: string
  /**
   * `vueform.group` selector membership, e.g. `adapters`.
   */
  group?: string
  /**
   * Short selector aliases from `vueform.alias`, e.g. `pv`.
   */
  aliases: string[]
  cwd: string
  cmd: string
  args: string[]
  /**
   * Additional commands run sequentially after `cmd` within the same task (same
   * bar); without `keepGoing`, the task fails on the first non-zero exit.
   */
  also?: Step[]
  /**
   * Run every step regardless of exit codes (issue-gathering queues like lint
   * and format:check), leaving pass/fail to `analyze`. A non-zero exit with
   * zero analyzed issues still counts as a hard failure (tool crash).
   */
  keepGoing?: boolean
  /**
   * Extracts warn/error counts from the task's combined output; they are
   * appended to the done line (yellow/red) and the queue continues.
   */
  analyze?: (task: Task, output: string) => Issues
  /**
   * Abort the whole queue (after this task's done line and the epilogue) when
   * `analyze` reports any issue — for pipelines like `verify` where later
   * stages are pointless on a dirty gate.
   */
  haltOnIssues?: boolean
  /**
   * Count content-changed files (via git) for this task and show `N fix(es)` on
   * its done line — for writing tasks (`--fix`, `--write`).
   */
  countFixes?: boolean
}

export interface Issues {
  warns: number
  errors: number
}

export interface PackageInfo {
  /**
   * Directory short name under `packages/`, e.g. `core`.
   */
  id: string
  /**
   * Published name, e.g. `@vueform/core`.
   */
  name: string
  dir: string
  group: string | undefined
  aliases: string[]
  scripts: Record<string, string>
}

/**
 * Every workspace package with a manifest, alphabetical.
 */
export function discoverPackages(): PackageInfo[] {
  const pkgs: PackageInfo[] = []
  for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    let manifest: Record<string, any>
    try {
      manifest = JSON.parse(
        readFileSync(join(packagesDir, entry.name, 'package.json'), 'utf8')
      )
    } catch {
      continue
    }
    const alias = manifest.vueform?.alias
    pkgs.push({
      id: entry.name,
      name: manifest.name,
      dir: join(packagesDir, entry.name),
      group: manifest.vueform?.group,
      aliases: Array.isArray(alias) ? alias : alias ? [alias] : [],
      scripts: manifest.scripts ?? {},
    })
  }
  return pkgs.sort((a, b) => a.id.localeCompare(b.id))
}

/**
 * Dependency-tiered ordering for queues where sequence matters (build): utils →
 * core → adapters → plugins → anything else, alphabetical within a tier.
 */
export function tierSort(tasks: Task[]): Task[] {
  const tier = (t: Task) =>
    t.id === 'utils'
      ? 0
      : t.id === 'core'
        ? 1
        : t.group === 'adapters'
          ? 2
          : t.group === 'plugins'
            ? 3
            : 4
  return [...tasks].sort(
    (a, b) => tier(a) - tier(b) || a.id.localeCompare(b.id)
  )
}

/**
 * One task per package whose manifest has `script`, alphabetical (callers
 * needing dependency order apply `tierSort`).
 */
export function discoverPackageTasks(script: string): Task[] {
  return discoverPackages()
    .filter((pkg) => pkg.scripts[script])
    .map((pkg) => ({
      id: pkg.id,
      timeKey: pkg.name,
      group: pkg.group,
      aliases: pkg.aliases,
      cwd: pkg.dir,
      cmd: 'pnpm',
      args: ['run', script],
    }))
}

/**
 * Narrows the task list by `--<id>`, `--<alias>` and `--<group>` selectors,
 * keeping the canonical order. No selectors returns the full list; an unknown
 * selector exits with the available ones.
 */
export function selectTasks(tasks: Task[], args: string[]): Task[] {
  if (args.length === 0) return tasks
  const selected = new Set<Task>()
  for (const raw of args) {
    const matches = matchTasks(tasks, raw)
    if (matches.length === 0) {
      const groups = new Set(tasks.map((t) => t.group).filter(Boolean))
      const available = [
        ...tasks.map((t) => [t.id, ...t.aliases].join('/')),
        ...groups,
      ].join(', ')
      console.error(`Unknown selector "${raw}". Available: ${available}`)
      process.exit(1)
    }
    for (const task of matches) selected.add(task)
  }
  return tasks.filter((t) => selected.has(t))
}

/**
 * The tasks a single selector matches — by group, id or alias — without exiting
 * on no match, for callers filtering several queues where a selector may only
 * apply to some (e.g. `verify`'s `--node`).
 */
export function matchTasks(tasks: Task[], selector: string): Task[] {
  const flag = selector.replace(/^--?/, '').toLowerCase()
  return tasks.filter(
    (t) => t.group === flag || t.id === flag || t.aliases.includes(flag)
  )
}

// Slate blue of the logo's left wing (#34495e), as 24-bit truecolor.
const slate = (text: string) => color('38;2;52;73;94', text)

const BANNER = [
  'XXXXXXXXXXX: ::::',
  ' XXXXXXXXX; ;;;: ',
  '  XXX+...  ;;;:  ',
  '   XXXXX  ;;;.   ',
  '        .;;;     ',
  '     :;;;;;      ',
  '      .;;;       ',
  '       .;        ',
  // ' █████████████▒ ░▒▒▒▒',
  // '  ███████████░ ▒▒▒▒▒ ',
  // '   ████▒      ▒▒▒▒▒  ',
  // '    ███████  ▒▒▒▒▒   ',
  // '     █████  ▒▒▒▒░    ',
  // '           ▒▒▒▒░     ',
  // '       ░▒▒▒▒▒▒░      ',
  // '        ░▒▒▒▒░       ',
  // '         ░▒▒         ',
  // '          ▒          ',
]

/**
 * Prints the Vueform logomark: slate triangle on the left, brand-green check on
 * the right (the single-group bottom lines are the check's tail).
 */
export function printBanner() {
  if (!isTTY) return
  for (const line of BANNER) {
    const wings = line.match(/^(\s*)(\S+)(\s+)(\S+)\s*$/)
    const out = wings
      ? `${wings[1]}${slate(wings[2])}${wings[3]}${green(wings[4])}`
      : line.replace(/\S+/, (run) => green(run))
    process.stdout.write(`${out}\n`)
  }
  process.stdout.write('\n')
}

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
const BAR_WIDTH = 22

/**
 * Renders the queue as a fixed block of lines, one per task, and rewrites
 * individual lines in place as their state changes. The cursor is parked on the
 * line below the block between updates.
 */
class TaskList {
  constructor(private lines: string[]) {}

  print() {
    if (!isTTY) return
    for (const line of this.lines) process.stdout.write(`${line}\n`)
  }

  update(index: number, line: string) {
    this.lines[index] = line
    if (!isTTY) return
    const up = this.lines.length - index
    process.stdout.write(`\x1b[${up}A\x1b[2K\r${line}\x1b[${up}B\r`)
  }
}

const pendingLine = (label: string) => dim(`◌ ${label}`)

function activeLine(
  label: string,
  elapsed: number,
  expected: number,
  tick: number
) {
  const ratio = Math.min(elapsed / expected, 0.98)
  const filled = Math.round(ratio * BAR_WIDTH)
  const bar = green('█'.repeat(filled)) + dim('░'.repeat(BAR_WIDTH - filled))
  const spinner = green(SPINNER[tick % SPINNER.length])
  return `${spinner} ${label} ${bar} ${formatSeconds(elapsed)}${dim(` / ~${formatSeconds(expected)}`)}`
}

const doneLine = (
  label: string,
  elapsed: number,
  ok: boolean,
  notes: string[] = []
) =>
  `${ok ? green('✓') : red('✗')} ${label} ${formatSeconds(elapsed)}${notes
    .map((note) => `${dim(' · ')}${note}`)
    .join('')}`

/**
 * Content hashes of every dirty (modified or untracked) file, for counting what
 * a writing task (eslint/stylelint `--fix`, prettier `--write`) really changed
 * — the tools themselves report no usable "fixes applied" count.
 */
function dirtyFileHashes(): Map<string, string> {
  const hashes = new Map<string, string>()
  let status: string
  try {
    status = execFileSync('git', ['status', '--porcelain'], {
      cwd: repoRoot,
    }).toString()
  } catch {
    return hashes
  }
  const paths = status
    .split('\n')
    .filter(Boolean)
    // "XY path" / rename "XY old -> new"; keep the current path.
    .map((line) => line.slice(3).split(' -> ').pop() as string)
    .filter((path) => !path.endsWith('/') && existsSync(join(repoRoot, path)))
  if (paths.length === 0) return hashes
  const out = execFileSync('git', ['hash-object', '--', ...paths], {
    cwd: repoRoot,
  })
    .toString()
    .trim()
    .split('\n')
  paths.forEach((path, i) => hashes.set(path, out[i]))
  return hashes
}

/**
 * Files whose content differs between two dirty-file snapshots (changed or
 * newly appearing).
 */
function countChanged(
  before: Map<string, string>,
  after: Map<string, string>
): number {
  let count = 0
  for (const [path, hash] of after) {
    if (before.get(path) !== hash) count++
  }
  return count
}

function runStep(
  step: Step,
  cwd: string
): Promise<{ code: number | null; output: string }> {
  return new Promise((resolvePromise) => {
    let output = ''
    const child = spawn(step.cmd, step.args, {
      cwd,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    child.stdout.on('data', (chunk: Buffer) => (output += chunk))
    child.stderr.on('data', (chunk: Buffer) => (output += chunk))
    child.on('close', (code) => resolvePromise({ code, output }))
  })
}

interface TaskResult {
  /**
   * Tool crash or unexpected non-zero exit — dumps output and aborts the queue.
   * Analyzed issues are not hard failures.
   */
  hardFail: boolean
  issues: Issues
  elapsed: number
  output: string
  /**
   * Rendered done-line state, kept for `--resume` replay.
   */
  ok: boolean
  notes: string[]
}

async function runTask(
  task: Task,
  label: string,
  expected: number,
  list: TaskList,
  index: number,
  verb: string
): Promise<TaskResult> {
  const started = Date.now()
  let tick = 0
  const before = task.countFixes ? dirtyFileHashes() : undefined

  const timer = isTTY
    ? setInterval(() => {
        list.update(
          index,
          activeLine(label, Date.now() - started, expected, tick++)
        )
      }, 100)
    : undefined
  if (!isTTY) console.log(`${verb} ${task.label ?? task.id}…`)

  let output = ''
  let failedExit = false
  for (const step of [
    { cmd: task.cmd, args: task.args },
    ...(task.also ?? []),
  ]) {
    const result = await runStep(step, task.cwd)
    output += result.output
    if (result.code !== 0) {
      failedExit = true
      if (!task.keepGoing) break
    }
  }

  if (timer) clearInterval(timer)
  const elapsed = Date.now() - started

  const issues = task.analyze?.(task, output) ?? { warns: 0, errors: 0 }
  const fixes = before ? countChanged(before, dirtyFileHashes()) : 0
  const hardFail = failedExit && issues.warns + issues.errors === 0 && !fixes

  const notes: string[] = []
  if (fixes) notes.push(`${fixes} fix${fixes === 1 ? '' : 'es'}`)
  if (issues.warns)
    notes.push(yellow(`${issues.warns} warn${issues.warns === 1 ? '' : 's'}`))
  if (issues.errors)
    notes.push(red(`${issues.errors} error${issues.errors === 1 ? '' : 's'}`))

  const ok = !hardFail && issues.errors === 0
  const line = doneLine(label, elapsed, ok, notes)
  if (isTTY) list.update(index, line)
  else console.log(line)
  return { hardFail, issues, elapsed, output, ok, notes }
}

export interface RunOptions {
  /**
   * Namespace for duration records in `.output/times.json`, e.g. `build`.
   */
  timesScope: string
  /**
   * Fallback expected duration when a task has no recorded time.
   */
  defaultMs: (task: Task) => number
  /**
   * Progress verb for non-TTY logs, e.g. `building`.
   */
  verb: string
  /**
   * Summary verb, e.g. `Built`.
   */
  doneVerb: string
  /**
   * Extracts noteworthy content from a successful task's captured output (e.g.
   * stray console warns during tests). Whatever it returns is dumped after the
   * whole queue finishes — the task-list block can't be printed into mid-run
   * without breaking its cursor math.
   */
  collectNotes?: (task: Task, output: string) => string | undefined
  /**
   * One-off summary printed after the collected notes (e.g. a warn count), or
   * nothing.
   */
  epilogue?: () => string | undefined
  /**
   * Failure-resume support: on any failure the completed prefix's results are
   * saved under `key` (which must encode everything that shapes the queue —
   * flags, selectors). With `use`, a matching saved state replays the completed
   * tasks' done lines verbatim and the run continues from the failed one. The
   * state file is cleared on success.
   */
  resume?: {
    path: string
    key: string
    use: boolean
  }
}

interface SavedTaskResult {
  label: string
  elapsed: number
  ok: boolean
  notes: string[]
}

interface ResumeState {
  key: string
  results: SavedTaskResult[]
}

/**
 * Runs the queue sequentially with the task-list renderer, records each task's
 * duration, and exits non-zero (dumping the captured output) on the first
 * failure.
 */
export async function runQueue(queue: Task[], options: RunOptions) {
  const timesPath = join(outputDir, 'times.json')
  let allTimes: Record<string, Record<string, number>>
  try {
    allTimes = JSON.parse(readFileSync(timesPath, 'utf8'))
  } catch {
    allTimes = {}
  }
  const timesFor = (task: Task) =>
    (allTimes[task.timeScope ?? options.timesScope] ??= {})

  const labelWidth = Math.max(...queue.map((t) => (t.label ?? t.id).length))
  const labels = queue.map((t) => (t.label ?? t.id).padEnd(labelWidth))
  const startedAll = Date.now()

  // A completed prefix from a previously failed run: replayed verbatim,
  // execution continues after it.
  let replayed: SavedTaskResult[] = []
  if (options.resume?.use) {
    try {
      const state: ResumeState = JSON.parse(
        readFileSync(options.resume.path, 'utf8')
      )
      const labelsMatch = state.results.every(
        (result, index) => result.label === labels[index]
      )
      if (state.key === options.resume.key && labelsMatch) {
        replayed = state.results
      }
    } catch {
      // No usable state — run from the start.
    }
  }
  const completed: SavedTaskResult[] = [...replayed]

  const saveState = () => {
    if (!options.resume) return
    writeFileSync(
      options.resume.path,
      `${JSON.stringify({ key: options.resume.key, results: completed } satisfies ResumeState, null, 2)}\n`
    )
  }
  const clearState = () => {
    if (options.resume) rmSync(options.resume.path, { force: true })
  }

  printBanner()
  const list = new TaskList(
    labels.map((label, index) => {
      const done = replayed[index]
      return done
        ? doneLine(label, done.elapsed, done.ok, done.notes)
        : pendingLine(label)
    })
  )
  list.print()
  if (!isTTY) {
    for (const done of replayed) {
      console.log(doneLine(done.label, done.elapsed, done.ok, done.notes))
    }
  }

  const notes: string[] = []

  const flushNotes = () => {
    for (const note of notes) process.stdout.write(`\n${note}\n`)
    const epilogue = options.epilogue?.()
    if (epilogue) process.stdout.write(`\n${epilogue}\n`)
  }

  for (const [index, task] of queue.entries()) {
    if (index < replayed.length) continue
    const times = timesFor(task)
    const expected = times[task.timeKey] ?? options.defaultMs(task)
    const {
      hardFail,
      issues,
      elapsed,
      output,
      ok,
      notes: taskNotes,
    } = await runTask(task, labels[index], expected, list, index, options.verb)
    if (hardFail) {
      saveState()
      process.stdout.write(`\n${output}\n`)
      console.error(red(`${task.label ?? task.id} failed.`))
      process.exit(1)
    }
    const note = options.collectNotes?.(task, output)
    if (note) notes.push(note)
    times[task.timeKey] = elapsed
    writeFileSync(timesPath, `${JSON.stringify(allTimes, null, 2)}\n`)

    if (task.haltOnIssues && issues.warns + issues.errors > 0) {
      saveState()
      flushNotes()
      console.error(
        red(
          `Aborted: ${task.label ?? task.id} reported issues; later stages skipped.`
        )
      )
      process.exit(1)
    }
    completed.push({ label: labels[index], elapsed, ok, notes: taskNotes })
  }

  clearState()
  flushNotes()

  console.log(
    dim(
      `${options.doneVerb} ${queue.length} task(s) in ${formatSeconds(Date.now() - startedAll)}.`
    )
  )
}
