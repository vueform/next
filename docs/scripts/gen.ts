/**
 * Docs generator runner (`pnpm gen` in docs/, `pnpm docs:gen` at the root):
 * every docs generator with the shared live per-task display — one row per
 * generator, spinner and elapsed time while working, green/red status when
 * done. No logs are kept; a failed generator's captured output is dumped
 * after the run.
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

async function main(): Promise<void> {
  const {
    createPaint,
    createRows,
    resolveTerminalMode,
    trackChild,
    untrackChild,
  } = await import('@vueform/utils/terminal')

  const ids = [...PARALLEL, ...CLOSERS]
  const runStarted = Date.now()
  const mode = resolveTerminalMode()
  const { green, red, dim } = createPaint(mode.colors)

  const display = createRows({
    title: 'Docs generators',
    rows: ids.map((id) => ({ id, detail: 'waiting' })),
    mode,
  })

  const outputs = new Map<string, string>(ids.map((id) => [id, '']))
  const failed = new Set<string>()

  function runTask(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      display.start(id)

      const child = spawn(
        'pnpm',
        [
          'exec',
          'tsx',
          path.join(DOCS_DIR, 'scripts', 'generators', `${id}.ts`),
        ],
        {
          cwd: DOCS_DIR,
          stdio: ['ignore', 'pipe', 'pipe'],
          detached: process.platform !== 'win32',
        }
      )
      trackChild(child)
      child.stdout.on('data', (chunk: Buffer) => {
        outputs.set(id, outputs.get(id)! + chunk.toString())
      })
      child.stderr.on('data', (chunk: Buffer) => {
        outputs.set(id, outputs.get(id)! + chunk.toString())
      })

      child.on('close', (code) => {
        untrackChild(child)
        const ok = code === 0
        if (ok) display.pass(id)
        else {
          failed.add(id)
          display.fail(id, `exited with ${code}`)
        }
        resolve(ok)
      })
    })
  }

  let ok = (await Promise.all(PARALLEL.map(runTask))).every(Boolean)

  for (const id of CLOSERS) {
    if (ok) {
      ok = await runTask(id)
    } else {
      display.skip(id)
    }
  }

  display.finish()

  if (failed.size) {
    for (const id of ids) {
      if (!failed.has(id)) continue
      console.log(`\n${dim(`––––– ${id} –––––`)}\n`)
      console.log(outputs.get(id)!.trimEnd())
    }
    console.log(
      `\n${red(`${failed.size} of ${ids.length} docs generators failed.`)}\n`
    )
    process.exit(1)
  }

  console.log(
    `\n${green(`All docs generated in ${((Date.now() - runStarted) / 1000).toFixed(1)}s.`)}\n`
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
