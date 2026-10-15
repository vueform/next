/**
 * API extraction runner (`pnpm api`): every extractor of
 * scripts/api-extractor plus the closing `assemble` step, with the shared
 * live per-task display — one row per target, spinner and elapsed time while
 * working, green/red status when done. All captured output is written to
 * `.vueform/api/logs/<stamp>.log` (one section per task); failures are
 * distilled into `<stamp>.errors.log` and fail the run.
 *
 * No selection flags, no validation, no issues tracking — those are gone
 * pending the extractor rework (`--verbose`/`--ci` display flags work). The
 * contract for now: the `.vueform/api/` jsons are generated, and any error
 * along the way is surfaced loudly.
 *
 * Ordering: extractors run in parallel, except `features`, which waits for
 * `blueprints` (it enriches from its raw output); `assemble` runs last and
 * is skipped when any extractor failed (its inputs would be incomplete).
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { ensureUtilsDist } from './ensure-utils'

const repoRoot = path.resolve(
  fileURLToPath(new URL('.', import.meta.url)),
  '..'
)
const extractorDir = path.join(repoRoot, 'scripts', 'api-extractor')

// The extractors import @vueform/utils, which resolves to its DIST (and so
// does `./terminal` below) — make sure it is current before the dynamic
// imports. Invoked here (vp-cached, instant on a warm hit) rather than as a
// vp dependsOn, so `pnpm api` keeps the real TTY and the live display works.
ensureUtilsDist()

const {
  createPaint,
  createRows,
  createRunLog,
  resolveTerminalMode,
  termLink,
  trackChild,
  untrackChild,
} = await import('./terminal')
const { collectMissingDescriptions, writeMissingReport } =
  await import('./api-extractor/lib/missing')
const { FILES } = await import('./api-extractor/lib/output')

interface ExtractTask {
  id: string
  script: string
}

const tasks: ExtractTask[] = [
  ...FILES.map((name) => ({
    id: name,
    script: path.join(extractorDir, 'extractors', `${name}.ts`),
  })),
  { id: 'assemble', script: path.join(extractorDir, 'assemble.ts') },
]

const mode = resolveTerminalMode()
const { green, red, yellow, dim } = createPaint(mode.colors)

// Lives inside the output tree — assemble only removes its own raw files,
// never this folder.
const log = createRunLog({
  dir: path.join(repoRoot, '.vueform', 'api', 'logs'),
})

const runStarted = Date.now()
const display = createRows({
  title: 'API extraction',
  rows: tasks.map(({ id }) => ({ id, detail: 'waiting' })),
  mode,
})

const outputs = new Map<string, string>(tasks.map(({ id }) => [id, '']))
const failed = new Set<string>()

function runTask(task: ExtractTask): Promise<boolean> {
  return new Promise((resolve) => {
    display.start(task.id)

    const child = spawn('pnpm', ['exec', 'tsx', task.script], {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: process.platform !== 'win32',
    })
    trackChild(child)
    child.stdout.on('data', (chunk: Buffer) => {
      outputs.set(task.id, outputs.get(task.id)! + chunk.toString())
    })
    child.stderr.on('data', (chunk: Buffer) => {
      outputs.set(task.id, outputs.get(task.id)! + chunk.toString())
    })

    child.on('close', (code) => {
      untrackChild(child)
      const ok = code === 0
      log.section(task.id)
      log.write(outputs.get(task.id)!)
      if (ok) display.pass(task.id)
      else {
        failed.add(task.id)
        display.fail(task.id, `exited with ${code}`)
      }
      if (mode.verbose) {
        console.log(`\n––––– ${task.id} –––––\n`)
        console.log(outputs.get(task.id)!.trimEnd())
      }
      resolve(ok)
    })
  })
}

const extractorRuns = new Map<string, Promise<boolean>>()
for (const task of tasks) {
  if (task.id === 'assemble') continue
  if (task.id === 'features') {
    // Enriches from the blueprints raw output — wait for that extraction
    // (run either way: on a blueprints failure the run fails regardless).
    extractorRuns.set(
      task.id,
      extractorRuns.get('blueprints')!.then(() => runTask(task))
    )
  } else {
    extractorRuns.set(task.id, runTask(task))
  }
}

const extractorsOk = (await Promise.all(extractorRuns.values())).every(Boolean)

if (extractorsOk) {
  await runTask(tasks.find(({ id }) => id === 'assemble')!)
} else {
  display.skip('assemble')
}

display.finish()
log.close()

// ---------------------------------------------------------------------------
// Summary + distilled error log.

const errorsFile = log.writeErrors(
  tasks
    .filter(({ id }) => failed.has(id))
    .map(({ id }) => ({
      name: id,
      body: outputs.get(id)!.trimEnd() || '(no output)',
    }))
)

if (errorsFile) {
  console.log(
    `\n${red(`${failed.size} of ${tasks.length} extraction tasks failed - see full error log:`)}\n${termLink(errorsFile, mode)}`
  )
} else {
  console.log(
    `\n${green(`All targets extracted in ${((Date.now() - runStarted) / 1000).toFixed(1)}s.`)}`
  )

  const missing = collectMissingDescriptions()
  const missingFile = writeMissingReport(missing)
  const total = Object.keys(missing).length

  if (total > 0) {
    console.log(
      `\n${yellow(
        `⚠ ${total} missing description${total > 1 ? 's' : ''}`
      )}${dim(' — ')}${termLink(missingFile, mode)}`
    )
  }
}
console.log('')

if (failed.size) process.exit(1)
