/**
 * Bundle-size measurement (`pnpm size`): one live row per package with a
 * `size` script (tier order, so adapter reports embed fresh core numbers),
 * each row running `vp run --filter <pkg> size` with live `x/n measurements`
 * progress from the suite's `[x/n] scenario ...` lines. The workspace is
 * built upfront via the cached `:build` task, and the README size sections
 * are regenerated from the fresh measurements afterwards. `--report` only
 * regenerates the README sections (near-instant, plain output). Selection flags
 * work as before (`--core`, `--pv`, `--adapters`). Output goes to
 * `.vueform/size/logs`.
 */
import { spawnSync } from 'node:child_process'

import { runGui, stripGuiFlags } from './gui'
import {
  discoverPackageTasks,
  green,
  red,
  repoRoot,
  selectTasks,
  tierSort,
} from './runner'

const args = process.argv.slice(2)
const report = args.includes('--report')
const selectors = stripGuiFlags(args).filter((arg) => arg !== '--report')

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
} else {
  // Measurements bundle the dists — make sure they are current (vp-cached).
  const build = spawnSync('pnpm', ['exec', 'vpr', ':build'], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
  if (build.status !== 0) {
    console.error(build.stdout + build.stderr)
    process.exit(build.status ?? 1)
  }

  void runGui({
    title: 'Bundle size',
    scope: 'size',
    rows: tasks.map((task) => {
      let measured = 0
      return {
        name: task.timeKey,
        cmd: 'pnpm',
        args: [
          'exec',
          'vp',
          'run',
          '--filter',
          `./packages/${task.id}`,
          'size',
        ],
        onLine: (line: string, setProgress: (text: string) => void) => {
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
  }).then((ok) => {
    if (!ok) process.exit(1)
    runReport()
  })
}
