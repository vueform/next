/**
 * Issue reporting shared by the orchestrators: the markdown issue-file renderer
 * (used for test warns and lint errors), and the lint/format output analyzers
 * with their end-of-run summaries. Analyzers only accumulate; summaries render
 * once after the queue, so the markdown files' line numbers are final when the
 * terminal links to them.
 */
import { rmSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import {
  badge,
  dim,
  outputDir,
  red,
  repoRoot,
  yellow,
  type Task,
} from './runner'

const HEADING_AT = 80

export interface IssueEntry {
  /**
   * Section heading; derived from the message's first characters when omitted.
   */
  heading?: string
  message: string
  files: string[]
}

/**
 * Writes an issue markdown file — per entry: a heading from the message's first
 * characters, the verbatim message in a code fence under "Full message:", then
 * the repo-relative paths under "Affected files:". Returns each entry's fence
 * content start line, for terminal links.
 */
export function writeIssuesFile(
  path: string,
  entries: IssueEntry[]
): Map<string, number> {
  const lines: string[] = []
  const fenceLines = new Map<string, number>()
  for (const { heading: givenHeading, message, files } of entries) {
    const [firstLine] = message.split('\n')
    const fallback =
      firstLine.length > HEADING_AT
        ? `${firstLine.slice(0, HEADING_AT)}…`
        : firstLine
    const heading = givenHeading ?? fallback
    lines.push(`## ${heading}`, '', 'Full message:', '', '```')
    fenceLines.set(message, lines.length + 1)
    lines.push(...message.split('\n'), '```', '')
    lines.push('Affected files:', '', ...files.map((file) => `- ${file}`), '')
  }
  writeFileSync(path, `${lines.join('\n')}\n`)
  return fenceLines
}

const stripAnsi = (text: string) => text.replace(/\x1b\[[0-9;]*m/g, '')

// ============ LINT ============

const lintErrorsPath = join(outputDir, 'lint-errors.md')
rmSync(lintErrorsPath, { force: true })

let lintWarns = 0
let lintErrors = 0
/**
 * Per affected file (repo-relative): its diagnostics block.
 */
const lintErrorBlocks = new Map<string, string>()

/**
 * Counts eslint/stylelint problems from their stylish summaries (`✖ N problems
 * (E errors, W warnings)`) and collects the per-file diagnostic blocks that
 * contain errors.
 */
export function analyzeLintOutput(task: Task, output: string) {
  const plain = stripAnsi(output)
  let warns = 0
  let errors = 0
  for (const match of plain.matchAll(
    /✖ \d+ problems? \((\d+) errors?, (\d+) warnings?\)/g
  )) {
    errors += Number(match[1])
    warns += Number(match[2])
  }

  // Stylish output: an absolute file path line, then indented diagnostics.
  let file: string | undefined
  let block: string[] = []
  const flush = () => {
    if (file && block.some((line) => / error | ✖ /.test(line))) {
      lintErrorBlocks.set(file, block.join('\n').trimEnd())
    }
  }
  for (const line of plain.split('\n')) {
    if (line.startsWith(repoRoot)) {
      flush()
      file = relative(repoRoot, line.trim())
      block = []
    } else if (file && /^\s+\d+:\d+/.test(line)) {
      block.push(line)
    } else if (file && line.trim() === '') {
      flush()
      file = undefined
    }
  }
  flush()

  lintWarns += warns
  lintErrors += errors
  return { warns, errors }
}

/**
 * The lint queue's end-of-run summary: totals, the error file when errors
 * exist, and the exact auto-fix command to copy.
 */
export function lintSummary(fix: boolean, selectors: string[]) {
  if (lintWarns + lintErrors === 0) return undefined
  const parts: string[] = []
  if (lintErrors) {
    const entries = [...lintErrorBlocks.entries()].map(([file, message]) => ({
      heading: file,
      message,
      files: [file],
    }))
    writeIssuesFile(lintErrorsPath, entries)
    parts.push(
      `${red(`✗ ${lintErrors} lint error${lintErrors === 1 ? '' : 's'} found`)}${dim(` — ${lintErrorsPath}`)}`
    )
  }
  if (lintWarns) {
    parts.push(
      yellow(`⚠ ${lintWarns} lint warn${lintWarns === 1 ? '' : 's'} found`)
    )
  }
  if (!fix) {
    parts.push(
      `\nTry auto-fixing with: ${badge(` ${`pnpm lint --fix ${selectors.join(' ')}`.trim()} `)}\n`
    )
  }
  return parts.join('\n')
}

export const lintTotals = () => ({ warns: lintWarns, errors: lintErrors })

// ============ FORMAT ============

let formatWarns = 0
let formatErrors = 0

/**
 * Counts prettier `--check` findings: each `[warn] <file>` is one warn (an
 * unformatted file), `[error]` lines (syntax failures) are errors.
 */
export function analyzeFormatOutput(_task: Task, output: string) {
  const plain = stripAnsi(output)
  let warns = 0
  let errors = 0
  for (const line of plain.split('\n')) {
    if (/^\[warn\] /.test(line) && !/Code style issues/.test(line)) warns++
    if (/^\[error\]/.test(line)) errors++
  }
  formatWarns += warns
  formatErrors += errors
  return { warns, errors }
}

export function formatSummary(write: boolean, selectors: string[]) {
  if (formatWarns + formatErrors === 0) return undefined
  const parts: string[] = []
  if (formatErrors) {
    parts.push(
      red(
        `✗ ${formatErrors} format error${formatErrors === 1 ? '' : 's'} found`
      )
    )
  }
  if (formatWarns) {
    parts.push(
      yellow(
        `⚠ ${formatWarns} unformatted file${formatWarns === 1 ? '' : 's'} found`
      )
    )
  }
  if (!write) {
    parts.push(
      `\nAuto-format with: ${badge(` ${`pnpm format ${selectors.join(' ')}`.trim()} `)}\n`
    )
  }
  return parts.join('\n')
}

export const formatTotals = () => ({
  warns: formatWarns,
  errors: formatErrors,
})
