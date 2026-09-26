/**
 * Monorepo verification pipeline (`pnpm verify`): lint → format check →
 * typecheck → build → test, as one task list. Lint and format run as one bar
 * each; typecheck, build and test keep a bar per part. Selection flags work
 * like the build orchestrator's and narrow every stage (`pnpm verify --pv`
 * lints, format-checks, typechecks, builds and tests primevue only); a selector
 * only some stages know (e.g. `--node`) narrows those and leaves the others
 * out.
 *
 * The lint and format stages gather all their issues in one pass, but any warn
 * or error there aborts the pipeline before the later stages — a dirty gate
 * makes them pointless. With `--fix`, lint runs its autofixes and format writes
 * instead of checking; remaining (unfixable) issues still abort.
 *
 * Stage durations reuse the times recorded by the single-purpose orchestrators
 * via per-task time scopes.
 */
import { join } from 'node:path'
import {
  analyzeFormatOutput,
  analyzeLintOutput,
  formatSummary,
  lintSummary,
} from './issues'
import { matchTasks, outputDir, runQueue, type Task } from './runner'
import {
  buildTasks,
  checkTasks,
  formatTasks,
  lintTasks,
  mergeTasks,
  testTasks,
} from './tasks'
import { collectWarns, warnSummary } from './warns'

const DEFAULT_MS: Record<string, number> = {
  lint: 20_000,
  format: 5_000,
  check: 8_000,
  build: 8_000,
  test: 15_000,
}

const args = process.argv.slice(2)
// --fix: apply lint autofixes and write formatting instead of checking it.
const fix = args.includes('--fix')
// --resume: continue a previously failed run from its failed step.
const resume = args.includes('--resume')
const selectors = args.filter((arg) => arg !== '--fix' && arg !== '--resume')

/**
 * Narrows a stage's tasks without failing on selectors the stage doesn't know;
 * overall selector validity is checked across all stages below.
 */
function narrow(tasks: Task[]): Task[] {
  if (selectors.length === 0) return tasks
  const selected = new Set<Task>()
  for (const selector of selectors) {
    for (const task of matchTasks(tasks, selector)) selected.add(task)
  }
  return tasks.filter((t) => selected.has(t))
}

const lintSelection = narrow(lintTasks(fix))
const formatSelection = narrow(formatTasks(fix))

const stages: { scope: string; labelPrefix?: string; tasks: Task[] }[] = [
  {
    scope: 'lint',
    tasks: lintSelection.length
      ? [
          {
            ...mergeTasks('lint', lintSelection),
            keepGoing: true,
            analyze: analyzeLintOutput,
            countFixes: fix,
            haltOnIssues: true,
          },
        ]
      : [],
  },
  {
    scope: 'format',
    tasks: formatSelection.length
      ? [
          {
            ...mergeTasks('format', formatSelection),
            label: fix ? 'format' : 'check format',
            keepGoing: true,
            analyze: analyzeFormatOutput,
            countFixes: fix,
            haltOnIssues: true,
          },
        ]
      : [],
  },
  { scope: 'check', labelPrefix: 'typecheck', tasks: narrow(checkTasks()) },
  { scope: 'build', tasks: narrow(buildTasks()) },
  { scope: 'test', tasks: narrow(testTasks()) },
]

// A selector must match in at least one stage to be valid at all.
if (selectors.length) {
  const all = [
    ...lintTasks(false),
    ...checkTasks(),
    ...buildTasks(),
    ...testTasks(),
  ]
  for (const selector of selectors) {
    if (matchTasks(all, selector).length === 0) {
      const available = [
        ...new Set(
          all.flatMap((t) => [
            t.id,
            ...t.aliases,
            ...(t.group ? [t.group] : []),
          ])
        ),
      ].join(', ')
      console.error(`Unknown selector "${selector}". Available: ${available}`)
      process.exit(1)
    }
  }
}

const queue = stages.flatMap(({ scope, labelPrefix, tasks }) =>
  tasks.map((task) => ({
    ...task,
    label:
      task.label ??
      (task.id === scope ? task.id : `${labelPrefix ?? scope} ${task.id}`),
    timeScope: scope,
  }))
)

runQueue(queue, {
  timesScope: 'verify',
  defaultMs: (task: Task) => DEFAULT_MS[task.timeScope ?? 'verify'] ?? 10_000,
  verb: 'verifying',
  doneVerb: 'Verified',
  collectNotes: collectWarns,
  resume: {
    path: join(outputDir, 'verify-state.json'),
    key: JSON.stringify({ fix, selectors }),
    use: resume,
  },
  epilogue: () =>
    [lintSummary(fix, selectors), formatSummary(fix, selectors), warnSummary()]
      .filter(Boolean)
      .join('\n\n') || undefined,
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
