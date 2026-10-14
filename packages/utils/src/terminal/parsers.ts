/**
 * Shared output parsers for the row runners: lint/format/typecheck issue
 * counts and vp's cache-hit summary detection.
 */

export function countLintIssues(output: string): number {
  let issues = 0
  // oxlint: `Found W warnings and E errors.`
  for (const match of output.matchAll(
    /Found (\d+) warnings? and (\d+) errors?/g
  )) {
    issues += Number(match[1]) + Number(match[2])
  }
  // stylelint/eslint stylish: `✖ N problems (…)`
  for (const match of output.matchAll(/✖ (\d+) problems?/g)) {
    issues += Number(match[1])
  }
  return issues
}

export function countFormatIssues(output: string): number {
  let issues = 0
  for (const line of output.split('\n')) {
    // `vp fmt --check` lists each unformatted file as `path (Xms)`; oxfmt's
    // own check mode prints `[warn] path` / `[error] …` lines.
    if (/^\S+ \(\d+ms\)$/.test(line)) issues++
    if (/^\[warn\] /.test(line) && !/Code style issues/.test(line)) issues++
    if (/^\[error\]/.test(line)) issues++
  }
  return issues
}

export function countTsErrors(output: string): number {
  return (output.match(/error TS\d+/g) ?? []).length
}

export const issuesDetail = (
  issues: number
): { detail?: string; issues?: number } =>
  issues > 0
    ? { detail: `${issues} issue${issues === 1 ? '' : 's'}`, issues }
    : {}

/**
 * vp prints one summary per invocation: `vp run: cache hit, …` for a fully
 * replayed single task, `vp run: N/M cache hit (P%)` when the graph had
 * several tasks. A step is cached only when nothing in it was rebuilt — a
 * partial hit means the step's own task ran fresh while a dependency
 * replayed, and per-task `◉ cache hit, replaying` lines must not count.
 */
export function isCached(output: string): boolean {
  if (/vp run: cache hit,/.test(output)) return true
  const hits = /vp run: (\d+)\/(\d+) cache hit/.exec(output)
  return hits !== null && hits[1] === hits[2]
}
