/**
 * Test-warn capture for the orchestrators (`test`, `verify`): parses vitest's
 * per-test captured console blocks, aggregates identical messages, writes the
 * full texts to `.output/tests.md`, and renders the terminal report. Collection
 * and rendering are split so the markdown file's line numbers are final when
 * the terminal links to them.
 */
import { rmSync } from 'node:fs'
import { join, relative } from 'node:path'
import { writeIssuesFile } from './issues'
import { badge, dim, outputDir, repoRoot, yellow, type Task } from './runner'

/**
 * Full captured messages of the current run, as markdown: one section per
 * unique message across all tasks (see `writeIssuesFile` for the shape).
 */
const messagesPath = join(outputDir, 'test-issues.md')
rmSync(messagesPath, { force: true })

const TERMINAL_LINES = 3

/**
 * Unique messages across all tasks (insertion-ordered), with every file they
 * occurred in.
 */
const uniqueWarns = new Map<string, string[]>()

interface TaskGroup {
  message: string
  /**
   * Files within this task's run, repo-relative.
   */
  files: string[]
}
const taskReports: { taskId: string; groups: TaskGroup[] }[] = []
let totalWarns = 0

/**
 * Extracts vitest's captured console blocks (`stdout | file > test` / `stderr |
 * …`) and aggregates identical messages. Only collects; pass `warnReport` as
 * the queue's epilogue to render.
 */
export function collectWarns(task: Task, output: string): undefined {
  interface Block {
    file: string
    content: string[]
  }
  const blocks: Block[] = []
  let current: Block | undefined

  // Color-forcing environments (e.g. FORCE_COLOR in a shell profile) make
  // vitest emit ANSI-wrapped lines even through pipes — strip them so the
  // line-anchored block headers still match.
  const plain = output.replace(/\x1b\[[0-9;]*m/g, '')

  for (const line of plain.split('\n')) {
    const header = line.match(/^(stdout|stderr) \| (.+)$/)
    if (header) {
      current = { file: header[2].split(' > ')[0], content: [] }
      blocks.push(current)
      continue
    }
    // Blocks are terminated by a blank line in the reporter output.
    if (current && line.trim() === '') current = undefined
    else if (current) current.content.push(line)
  }

  // Repo-relative paths, so terminal link detection resolves them.
  const relBase = relative(repoRoot, task.cwd)
  const groups = new Map<string, string[]>()
  for (const block of blocks) {
    const message = block.content.join('\n').trimEnd()
    if (!message) continue
    totalWarns++
    const file = join(relBase, block.file)
    const seen = groups.get(message) ?? []
    if (!seen.includes(file)) seen.push(file)
    groups.set(message, seen)

    const known = uniqueWarns.get(message) ?? []
    if (!known.includes(file)) known.push(file)
    uniqueWarns.set(message, known)
  }
  if (groups.size === 0) return undefined

  taskReports.push({
    taskId: task.id,
    groups: [...groups.entries()].map(([message, files]) => ({
      message,
      files,
    })),
  })
  return undefined
}

/**
 * Writes `.output/test-issues.md` and returns each unique message's code-fence
 * content start line, for the terminal links.
 */
function writeMessagesFile(): Map<string, number> {
  return writeIssuesFile(
    messagesPath,
    [...uniqueWarns.entries()].map(([message, files]) => ({ message, files }))
  )
}

/**
 * Renders the whole warn report: per task, each aggregated message (first three
 * lines; the full text's `tests.md` location on its own line) above a badge
 * with the clickable path of the test file it first occurred in — then the
 * total-count summary.
 */
export function warnReport(): string | undefined {
  if (totalWarns === 0) return undefined
  const fenceLines = writeMessagesFile()

  const reports = taskReports.map(({ taskId, groups }) => {
    const sections = groups.map(({ message, files: [first, ...rest] }) => {
      const messageLines = message.split('\n')
      const truncated = messageLines.length > TERMINAL_LINES
      const display = truncated
        ? `${messageLines.slice(0, TERMINAL_LINES).join('\n')}…`
        : message
      // Linked even when nothing was truncated — the entry also lists every
      // file the terminal's `+N files` elides.
      const link = dim(`${messagesPath}:${fenceLines.get(message)}`)
      const suffix = rest.length
        ? dim(` +${rest.length} file${rest.length > 1 ? 's' : ''}`)
        : ''
      return `${display}\n${link}\n${badge(` ${first} `)}${suffix}`
    })
    return `${yellow(`⚠ ${taskId}: tests produced console output`)}\n\n${sections.join('\n\n')}`
  })

  return `${reports.join('\n\n')}\n\n${warnSummary()}`
}

/**
 * Just the total-count line with the report file — for pipelines (verify) that
 * shouldn't dump the individual warns into the terminal. Writes the markdown
 * file as a side effect.
 */
export function warnSummary(): string | undefined {
  if (totalWarns === 0) return undefined
  writeMessagesFile()
  return `${yellow(`⚠ ${totalWarns} test warn${totalWarns > 1 ? 's' : ''} found`)}${dim(` — ${messagesPath}`)}`
}
