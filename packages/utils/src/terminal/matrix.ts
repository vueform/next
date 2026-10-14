/**
 * The matrix display format: a row × column status grid (the smoke harness's
 * env × stage view) with a spinner per active cell, a per-row elapsed
 * counter, and a transient phase line. Imperative API, same contract as the
 * rows format: live repaint on a TTY, `[<tag>:<row>] <column> ✓` completion
 * lines otherwise.
 */
import { createFrame } from './frame'
import type { TerminalMode } from './mode'
import { createPaint } from './paint'

export type CellStatus = 'pending' | 'active' | 'pass' | 'fail' | 'skip'

const GLYPH: Record<CellStatus, string> = {
  pending: '·',
  active: '', // spinner frame, filled in at render time
  pass: '✓',
  fail: '✗',
  skip: '–',
}

const COLUMN_WIDTH = 13
const fmtSecs = (ms: number) => `${(ms / 1000).toFixed(1)}s`
const TIME_WIDTH = '999.9s'.length

export interface MatrixOptions {
  title: string
  /**
   * Gray parenthesized suffix after the title (the smoke adapter).
   */
  subtitle?: string
  /**
   * Row ids in display order.
   */
  rows: string[]
  /**
   * Column names in display order (the smoke stages).
   */
  columns: readonly string[]
  mode: TerminalMode
  /**
   * The `[<tag>:<row>]` prefix for plain completion lines.
   */
  tag: string
  /**
   * The prefix of plain phase lines (`[<phaseTag>] <text>`) when it differs
   * from `tag` (smoke phases drop the adapter segment). Defaults to `tag`.
   */
  phaseTag?: string
}

export interface MatrixDisplay {
  cell(row: string, column: string, status: CellStatus): void
  /**
   * Transient status line below the grid (packing, assembling, …).
   */
  phase(text: string | null): void
  /**
   * Final repaint + cursor restore; leaves the finished grid on screen.
   * Idempotent.
   */
  finish(): void
}

export function createMatrix(opts: MatrixOptions): MatrixDisplay {
  const { mode } = opts
  const { green, red, cyan, gray, dim, bold } = createPaint(mode.colors)

  const grid = new Map<string, Map<string, CellStatus>>()
  for (const id of opts.rows) {
    grid.set(id, new Map(opts.columns.map((column) => [column, 'pending'])))
  }

  // Elapsed-time tracking: each row counts from its first active cell until
  // it fails or finishes.
  const rowStarted = new Map<string, number>()
  const rowElapsed = new Map<string, string>()
  const rowVerdict = new Map<string, 'pass' | 'fail'>()
  const trackTiming = (row: string, status: CellStatus) => {
    if (status === 'active' && !rowStarted.has(row)) {
      rowStarted.set(row, Date.now())
    }
    const values = [...grid.get(row)!.values()]
    const failed = values.includes('fail')
    const done =
      failed || values.every((value) => value === 'pass' || value === 'skip')
    if (done && rowStarted.has(row) && !rowElapsed.has(row)) {
      rowElapsed.set(row, fmtSecs(Date.now() - rowStarted.get(row)!))
      rowVerdict.set(row, failed ? 'fail' : 'pass')
    }
  }
  const rowTime = (row: string): string => {
    const text = (
      rowElapsed.get(row) ??
      (rowStarted.has(row) ? fmtSecs(Date.now() - rowStarted.get(row)!) : '')
    ).padStart(TIME_WIDTH)
    const verdict = rowVerdict.get(row)
    return verdict === 'pass'
      ? green(text)
      : verdict === 'fail'
        ? red(text)
        : dim(text)
  }

  let phaseText: string | null = null

  if (!mode.live) {
    return {
      cell(row, column, status) {
        grid.get(row)!.set(column, status)
        trackTiming(row, status)
        if (status === 'pass' || status === 'fail') {
          console.log(
            `[${opts.tag}:${row}] ${column} ${status === 'pass' ? '✓' : '✗'}`
          )
        }
      },
      phase(text) {
        phaseText = text
        if (text) console.log(`[${opts.phaseTag ?? opts.tag}] ${text}`)
      },
      finish() {},
    }
  }

  const rowWidth = Math.max(...opts.rows.map((id) => id.length), 4) + 2

  const renderLines = (): string[] => {
    const spin = frame.spin()
    const lines: string[] = []
    lines.push(
      opts.subtitle
        ? bold(`${opts.title} `) + gray(`(${opts.subtitle})`)
        : bold(opts.title)
    )
    lines.push(
      dim(
        '  ' +
          'env'.padEnd(rowWidth) +
          opts.columns.map((column) => column.padEnd(COLUMN_WIDTH)).join('')
      )
    )
    for (const [id, cells] of grid) {
      let row = '  ' + id.padEnd(rowWidth)
      for (const column of opts.columns) {
        const status = cells.get(column)!
        const glyph = status === 'active' ? cyan(spin) : GLYPH[status]
        const colored =
          status === 'pass'
            ? green(glyph)
            : status === 'fail'
              ? red(glyph)
              : status === 'active'
                ? glyph
                : dim(glyph)
        // Center-ish under the header label.
        const pad = Math.floor(column.length / 2)
        row += ' '.repeat(pad) + colored + ' '.repeat(COLUMN_WIDTH - pad - 1)
      }
      row += rowTime(id)
      lines.push(row)
    }
    if (phaseText) lines.push(dim(`  ${spin} ${phaseText}`))
    return lines
  }

  const frame = createFrame(renderLines)
  frame.start()

  let finished = false

  return {
    cell(row, column, status) {
      grid.get(row)!.set(column, status)
      trackTiming(row, status)
      frame.repaint()
    },
    phase(text) {
      phaseText = text
      frame.repaint()
    },
    finish() {
      if (finished) return
      finished = true
      phaseText = null
      frame.repaint()
      frame.done()
    },
  }
}
