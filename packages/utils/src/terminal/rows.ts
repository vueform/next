/**
 * The list-rows display format: one row per step, spinner with live progress
 * while active, then ✓/✗/– with a status text, issue/warn counts, elapsed
 * time and cache mark. Imperative API — execution (spawning, scheduling,
 * parsing) stays with the caller, which drives `start`/`progress`/`pass`/
 * `fail`/`skip`. Live repaint on a TTY; plain completion lines otherwise
 * (full row lines, or `[tag:id]` lines, or silence for callers that print
 * their own).
 */
import { createFrame } from './frame'
import type { TerminalMode } from './mode'
import { createPaint } from './paint'

export type RowStatus = 'pending' | 'active' | 'pass' | 'fail' | 'skip'

export interface RowExtra {
  /**
   * Issue count — a passing row's detail renders yellow when positive.
   */
  issues?: number
  /**
   * Captured-warning count — rendered as a yellow ` · N warns` suffix.
   */
  warns?: number
  /**
   * Appends the dim ` (from cache)` mark.
   */
  cached?: boolean
}

export interface RowsOptions {
  title: string
  /**
   * Gray parenthesized suffix after the title (the smoke adapter).
   */
  subtitle?: string
  /**
   * Rows in display order. `label` is the shown text (defaults to `id`);
   * preset `status`/`detail` allow rows that arrive skipped or already
   * running ('waiting' pendings).
   */
  rows: { id: string; label?: string; status?: RowStatus; detail?: string }[]
  mode: TerminalMode
  /**
   * Non-live line style: 'rows' prints the full row line on completion (the
   * root runners), 'tag' prints `[<tag>:<id>] ✓ <detail>` lines (smoke), and
   * 'none' prints nothing — the caller logs its own lines (bench). Defaults
   * to 'tag' when `tag` is set, 'rows' otherwise.
   */
  plain?: 'rows' | 'tag' | 'none'
  /**
   * The `[<tag>:<id>]` prefix for plain 'tag' lines.
   */
  tag?: string
  /**
   * The prefix of plain phase lines (`[<phaseTag>] <text>`) when it differs
   * from `tag` (smoke phases drop the adapter segment). Defaults to `tag`.
   */
  phaseTag?: string
  /**
   * Elapsed-time style: 'suffix' appends ` · 1.2s` to finished details and
   * the live seconds to active rows (the root runners); 'column' keeps a
   * right-aligned fixed-width counter per row (smoke-types); 'off' none.
   */
  timers?: 'suffix' | 'column' | 'off'
}

export interface RowsDisplay {
  /**
   * Pending → active; starts the row's clock. No-op once started.
   */
  start(id: string): void
  /**
   * The active row's live progress text (counts, sweep counters — formatted
   * by the caller).
   */
  progress(id: string, text: string): void
  pass(id: string, detail?: string, extra?: RowExtra): void
  fail(
    id: string,
    detail?: string,
    extra?: Pick<RowExtra, 'issues' | 'warns'>
  ): void
  skip(id: string, detail?: string): void
  /**
   * Late cache mark (a driver's full-cache sweep) — updates the row without
   * re-printing a plain line.
   */
  markCached(id: string): void
  /**
   * Transient status line below the rows (packing, assembling, …).
   */
  phase(text: string | null): void
  /**
   * The row's completion-style line (no spinner) — what plain mode prints.
   */
  rowLine(id: string): string
  status(id: string): RowStatus
  /**
   * Final repaint + cursor restore; leaves the finished rows on screen.
   * Idempotent.
   */
  finish(): void
}

interface RowState {
  label: string
  status: RowStatus
  startedAt: number
  elapsed: string
  progress: string
  detail: string
  issues: number
  warns: number
  cached: boolean
}

const fmtSecs = (ms: number) => `${(ms / 1000).toFixed(1)}s`
const TIME_WIDTH = '999.9s'.length

export function createRows(opts: RowsOptions): RowsDisplay {
  const { mode } = opts
  const paint = createPaint(mode.colors)
  const { green, red, yellow, cyan, gray, dim, bold } = paint
  const plain = opts.plain ?? (opts.tag ? 'tag' : 'rows')
  const timers = opts.timers ?? 'suffix'

  const states = new Map<string, RowState>(
    opts.rows.map((row) => [
      row.id,
      {
        label: row.label ?? row.id,
        status: row.status ?? 'pending',
        // Rows preset as active (a parallel runner starting everything at
        // once) begin their clock at construction.
        startedAt: row.status === 'active' ? Date.now() : 0,
        elapsed: '',
        progress: '',
        detail: row.detail ?? '',
        issues: 0,
        warns: 0,
        cached: false,
      },
    ])
  )

  const width =
    Math.max(...[...states.values()].map(({ label }) => label.length), 4) + 2

  let phaseText: string | null = null

  const liveSecs = (state: RowState) => fmtSecs(Date.now() - state.startedAt)

  const columnTime = (state: RowState): string => {
    const text = (
      state.elapsed || (state.startedAt > 0 ? liveSecs(state) : '')
    ).padStart(TIME_WIDTH)
    return state.status === 'pass'
      ? green(text)
      : state.status === 'fail'
        ? red(text)
        : dim(text)
  }

  const rowText = (state: RowState, spin: string): string => {
    const mark =
      state.status === 'active'
        ? cyan(spin)
        : state.status === 'pending'
          ? dim('·')
          : state.status === 'pass'
            ? green('✓')
            : state.status === 'fail'
              ? red('✗')
              : dim('–')
    const suffixTime = timers === 'suffix' && state.elapsed
    let detail: string
    if (state.status === 'active') {
      const live =
        timers === 'suffix'
          ? state.progress
            ? `${state.progress} · ${liveSecs(state)}`
            : liveSecs(state)
          : state.progress
      detail = live ? dim(live) : ''
    } else if (state.status === 'pass') {
      const base =
        state.issues > 0
          ? yellow(state.detail)
          : green(state.detail || (timers === 'suffix' ? state.elapsed : ''))
      detail =
        base +
        (state.warns > 0 ? yellow(` · ${state.warns} warns`) : '') +
        (state.detail && suffixTime ? dim(` · ${state.elapsed}`) : '') +
        (state.cached ? dim(' (from cache)') : '')
    } else if (state.status === 'fail') {
      detail =
        red(state.detail || 'failed') +
        (state.warns > 0 ? yellow(` · ${state.warns} warns`) : '') +
        (suffixTime ? dim(` · ${state.elapsed}`) : '')
    } else if (state.status === 'skip') {
      detail = dim(state.detail || 'skipped')
    } else {
      detail = state.detail ? dim(state.detail) : ''
    }
    const column =
      timers === 'column' ? `${detail ? ' ' : ''}${columnTime(state)}` : ''
    return `  ${mark} ${state.label.padEnd(width)}${detail}${column}`
  }

  const renderLines = (): string[] => {
    const spin = frame.spin()
    const lines = [
      opts.subtitle
        ? bold(`${opts.title} `) + gray(`(${opts.subtitle})`)
        : bold(opts.title),
      ...[...states.values()].map((state) => rowText(state, spin)),
    ]
    if (phaseText) lines.push(dim(`  ${spin} ${phaseText}`))
    return lines
  }

  const frame = createFrame(renderLines)

  if (mode.live) frame.start()
  else if (plain === 'rows') console.log(bold(opts.title))
  else if (plain === 'tag') {
    // Preset skips surface upfront — they will never complete.
    for (const [id, state] of states) {
      if (state.status === 'skip') {
        console.log(`[${opts.tag}:${id}] – ${state.detail}`)
      }
    }
  }

  const plainPrint = (id: string, state: RowState) => {
    if (mode.live || mode.verbose || plain === 'none') return
    if (plain === 'rows') {
      console.log(rowText(state, ''))
    } else if (state.status === 'pass' || state.status === 'fail') {
      console.log(
        `[${opts.tag}:${id}] ${state.status === 'pass' ? '✓' : '✗'}${state.detail ? ` ${state.detail}` : ''}`
      )
    }
  }

  const settle = (state: RowState) => {
    if (state.startedAt > 0 && !state.elapsed) {
      state.elapsed = fmtSecs(Date.now() - state.startedAt)
    }
  }

  let finished = false

  return {
    start(id) {
      const state = states.get(id)
      if (!state || state.status !== 'pending') return
      state.status = 'active'
      state.startedAt = Date.now()
      if (mode.live) frame.repaint()
    },
    progress(id, text) {
      const state = states.get(id)
      if (!state) return
      state.progress = text
      if (mode.live) frame.repaint()
    },
    pass(id, detail = '', extra = {}) {
      const state = states.get(id)
      if (!state || state.status === 'pass') return
      settle(state)
      state.status = 'pass'
      state.detail = detail
      state.issues = extra.issues ?? 0
      state.warns = extra.warns ?? 0
      state.cached = extra.cached ?? false
      if (mode.live) frame.repaint()
      else plainPrint(id, state)
    },
    fail(id, detail = '', extra = {}) {
      const state = states.get(id)
      if (!state || state.status === 'fail') return
      settle(state)
      state.status = 'fail'
      state.detail = detail
      state.issues = extra.issues ?? 0
      state.warns = extra.warns ?? state.warns
      if (mode.live) frame.repaint()
      else plainPrint(id, state)
    },
    skip(id, detail = '') {
      const state = states.get(id)
      if (!state || state.status === 'skip') return
      state.status = 'skip'
      state.detail = detail
      if (mode.live) frame.repaint()
      else plainPrint(id, state)
    },
    markCached(id) {
      const state = states.get(id)
      if (!state) return
      state.cached = true
      if (mode.live) frame.repaint()
    },
    phase(text) {
      phaseText = text
      if (mode.live) frame.repaint()
      else if (text && plain === 'tag') {
        console.log(`[${opts.phaseTag ?? opts.tag}] ${text}`)
      }
    },
    rowLine(id) {
      const state = states.get(id)
      return state ? rowText(state, '') : ''
    },
    status(id) {
      return states.get(id)?.status ?? 'pending'
    },
    finish() {
      if (finished) return
      finished = true
      phaseText = null
      if (mode.live) {
        frame.repaint()
        frame.done()
      }
    },
  }
}
