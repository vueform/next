/**
 * Queue builders shared by the orchestrators (`build`, `check`, `test`, `lint`,
 * `format`, `fix`).
 *
 * Script-based queues (`build`/`check`/`test`) delegate to each package's own
 * script. Tool-based queues (`lint`/`format`) invoke eslint/stylelint/prettier
 * from the repo root with path scoping, so the root configs and ignore files
 * apply uniformly; their `root` target covers everything outside `packages/`.
 */
import { relative } from 'node:path'
import {
  discoverPackages,
  discoverPackageTasks,
  repoRoot,
  tierSort,
  type Step,
  type Task,
} from './runner'

const exec = (bin: string, ...args: string[]): Step => ({
  cmd: 'pnpm',
  args: ['exec', bin, ...args],
})

/**
 * Tool-scoped targets: every workspace package plus `root` (everything outside
 * `packages/`, e.g. `scripts` and the root config files).
 */
interface ToolTarget {
  id: string
  timeKey: string
  group?: string
  aliases: string[]
  /**
   * Repo-relative path prefix, or undefined for the root remainder.
   */
  path?: string
}

function toolTargets(): ToolTarget[] {
  return [
    ...discoverPackages().map((pkg) => ({
      id: pkg.id,
      timeKey: pkg.name,
      group: pkg.group,
      aliases: pkg.aliases,
      path: relative(repoRoot, pkg.dir),
    })),
    { id: 'root', timeKey: 'root', aliases: [] },
  ]
}

const toolTask = (target: ToolTarget, steps: Step[]): Task => ({
  id: target.id,
  timeKey: target.timeKey,
  group: target.group,
  aliases: target.aliases,
  cwd: repoRoot,
  cmd: steps[0].cmd,
  args: steps[0].args,
  also: steps.slice(1),
})

function eslintStep(target: ToolTarget, fix: boolean): Step {
  const fixArgs = fix ? ['--fix'] : []
  return target.path
    ? exec('eslint', target.path, ...fixArgs)
    : exec(
        'eslint',
        '.',
        '--ignore-pattern',
        'packages/**',
        '--ignore-pattern',
        '.playgrounds/**',
        ...fixArgs
      )
}

function stylelintStep(target: ToolTarget, fix: boolean): Step {
  const fixArgs = fix ? ['--fix'] : []
  // --allow-empty-input: not every target has .scss files.
  return exec(
    'stylelint',
    target.path ? `${target.path}/**/*.scss` : 'scripts/**/*.scss',
    '--allow-empty-input',
    ...fixArgs
  )
}

function prettierStep(target: ToolTarget, write: boolean): Step {
  const mode = write ? '--write' : '--check'
  return target.path
    ? exec('prettier', target.path, mode)
    : exec('prettier', '.', '!packages', '!.playgrounds', mode)
}

export const lintTasks = (fix: boolean): Task[] =>
  toolTargets().map((target) =>
    toolTask(target, [eslintStep(target, fix), stylelintStep(target, fix)])
  )

export const formatTasks = (write: boolean): Task[] =>
  toolTargets().map((target) => toolTask(target, [prettierStep(target, write)]))

/**
 * `fix` = lint autofixes plus formatting, per target.
 */
export const fixTasks = (): Task[] =>
  toolTargets().map((target) =>
    toolTask(target, [
      eslintStep(target, true),
      stylelintStep(target, true),
      prettierStep(target, true),
    ])
  )

export const buildTasks = (): Task[] => tierSort(discoverPackageTasks('build'))

export const checkTasks = (): Task[] => [
  ...discoverPackageTasks('check'),
  {
    id: 'root',
    timeKey: 'root',
    aliases: [],
    cwd: repoRoot,
    cmd: 'pnpm',
    args: ['exec', 'vue-tsc', '--incremental', '--noEmit'],
  },
  {
    id: 'node',
    timeKey: 'node',
    aliases: [],
    cwd: repoRoot,
    cmd: 'pnpm',
    args: ['exec', 'tsc', '--noEmit', '-p', 'tsconfig.node.json'],
  },
]

export const testDtsTasks = (): Task[] => discoverPackageTasks('test-dts')

export const testTasks = (): Task[] =>
  // Vitest's default reporter omits the per-test captured console blocks in
  // non-TTY runs; the verbose reporter prints them, which is what the warn
  // report parses. (Assumes every `test` script is vitest.)
  discoverPackageTasks('test').map((task) => ({
    ...task,
    args: [...task.args, '--reporter=verbose'],
  }))

/**
 * Collapses a stage's tasks into a single task (one progress bar), running
 * every step of every task sequentially.
 */
export function mergeTasks(id: string, tasks: Task[]): Task {
  const steps = tasks.flatMap((task) => [
    { cmd: task.cmd, args: task.args },
    ...(task.also ?? []),
  ])
  return {
    id,
    timeKey: id,
    aliases: [],
    cwd: repoRoot,
    cmd: steps[0].cmd,
    args: steps[0].args,
    also: steps.slice(1),
  }
}
