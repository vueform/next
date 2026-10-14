/**
 * Bundle-size measurement (`pnpm size`): one live row per package with a
 * `size` script (tier order, so adapter reports embed fresh core numbers),
 * each row running its cached vp leg (`vpr :size:<pkg>`) with live
 * `x/n measurements` progress from the suite's `[x/n] scenario ...` lines.
 * The legs build the measured dists as dependencies and cache on them — an
 * untouched package replays instantly. The README size sections
 * are regenerated from the fresh measurements afterwards. `--report` only
 * regenerates the README sections (near-instant, plain output). Selection flags
 * work as before (`--core`, `--pv`, `--adapters`). Output goes to
 * `.vueform/size/logs`.
 */
import { spawnSync } from 'node:child_process'

import { ensureUtilsDist } from './ensure-utils'

ensureUtilsDist()

async function main(): Promise<void> {
  const { runRows, stripDisplayFlags } = await import('./terminal')
  const { discoverPackageTasks, green, red, selectTasks, tierSort } =
    await import('./runner')

  const args = process.argv.slice(2)
  const report = args.includes('--report')
  const selectors = stripDisplayFlags(args).filter((arg) => arg !== '--report')

  const script = report ? 'size:report' : 'size'
  const tasks = tierSort(selectTasks(discoverPackageTasks(script), selectors))

  // Near-instant README regeneration — plain output, no rows. Runs on its own
  // with `--report`, and after every successful measurement run, so the README
  // sections always reflect the latest numbers.
  const runReport = () => {
    const reportTasks = report
      ? tasks
      : tierSort(selectTasks(discoverPackageTasks('size:report'), selectors))
    for (const task of reportTasks) {
      console.log(green(`▸ ${task.id}`))
      const result = spawnSync(task.cmd, task.args, {
        cwd: task.cwd,
        stdio: 'inherit',
      })
      if (result.status !== 0) {
        console.error(red(`${task.id} failed.`))
        process.exit(result.status ?? 1)
      }
    }
  }

  if (report) {
    runReport()
    return
  }

  const ok = await runRows({
    title: 'Bundle size',
    scope: 'size',
    rows: tasks.map((task) => {
      let measured = 0
      // The leg's dependencies (`:size:core`, builds) stream their replayed
      // output through the same stdout, `[x/n]` lines included — only count
      // lines after the row's OWN task header has gone by.
      let inOwnTask = false
      return {
        name: task.timeKey,
        cmd: 'pnpm',
        // The vp leg builds the measured dists as dependencies and caches on
        // them — an untouched package replays instantly (from cache).
        args: ['exec', 'vpr', `:size:${task.id}`],
        onLine: (line: string, setProgress: (text: string) => void) => {
          if (line.includes(`--filter ${task.timeKey} run size`)) {
            inOwnTask = true
            return
          }
          if (!inOwnTask) return
          const step = line.match(/^\[(\d+)\/(\d+)\]/)
          if (step) {
            measured = Number(step[1])
            setProgress(`${step[1]}/${step[2]} measurements`)
          }
        },
        summarize: (_output: string, code: number) => ({
          detail: measured ? `${measured} measurements` : '',
          fail: code !== 0,
        }),
      }
    }),
  })
  if (!ok) process.exit(1)
  runReport()
}

void main()
