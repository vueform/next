/**
 * Minimal line diff for the register/unregister previews. Entry files are
 * small, so a plain LCS is plenty. Rendered as diff hunks: added lines as green
 * `+` lines, removed lines as red `-` lines, and the nearest non-blank line
 * above and below each hunk as (dimmed) context — a blank line says nothing
 * about where an edit lands. Colors follow the shared output helpers (TTY only,
 * NO_COLOR respected).
 */
import { dim, green, red } from './output.js'

interface Op {
  kind: 'same' | 'add' | 'del'
  line: string
}

function diffOps(before: string[], after: string[]): Op[] {
  const n = before.length
  const m = after.length
  const lcs: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(0)
  )

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] =
        before[i] === after[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1])
    }
  }

  const ops: Op[] = []
  let i = 0
  let j = 0

  while (i < n && j < m) {
    if (before[i] === after[j]) {
      ops.push({ kind: 'same', line: before[i++] })
      j++
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      ops.push({ kind: 'del', line: before[i++] })
    } else {
      ops.push({ kind: 'add', line: after[j++] })
    }
  }
  while (i < n) ops.push({ kind: 'del', line: before[i++] })
  while (j < m) ops.push({ kind: 'add', line: after[j++] })

  return ops
}

/**
 * Diff `before` → `after` as preview lines. Hunks closer than `mergeGap`
 * unchanged lines are shown as one; distinct hunks are separated by a `···`
 * line.
 */
export function diffPreview(
  before: string,
  after: string,
  mergeGap = 2
): string[] {
  const ops = diffOps(before.split('\n'), after.split('\n'))

  // Hunks: [start, end) index ranges over `ops` covering runs of changes,
  // merged when separated by at most `mergeGap` unchanged lines.
  const hunks: [number, number][] = []

  for (let i = 0; i < ops.length; i++) {
    if (ops[i].kind === 'same') continue

    const last = hunks[hunks.length - 1]

    if (last && i - last[1] <= mergeGap) last[1] = i + 1
    else hunks.push([i, i + 1])
  }

  const nonBlank = (op: Op) => op.kind === 'same' && op.line.trim() !== ''
  const lines: string[] = []

  hunks.forEach(([start, end], index) => {
    if (index > 0) lines.push(dim('···'))

    // Nearest non-blank unchanged line above and below the hunk.
    const above = ops.slice(0, start).reverse().find(nonBlank)
    const below = ops.slice(end).find(nonBlank)

    if (above) lines.push(dim(`  ${above.line}`))

    for (const op of ops.slice(start, end)) {
      if (op.kind === 'add') lines.push(green(`+ ${op.line}`))
      else if (op.kind === 'del') lines.push(red(`- ${op.line}`))
      else lines.push(dim(`  ${op.line}`))
    }

    if (below) lines.push(dim(`  ${below.line}`))
  })

  return lines
}
