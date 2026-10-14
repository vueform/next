/**
 * Terminal UI + log capture for the smoke harness, as thin adapters over the
 * shared terminal toolkit (`../terminal`): the env × stage matrix
 * (`createDisplay`), the flat rows variant (`createListDisplay`, the
 * smoke-types suite's choice), and the per-invocation session log under the
 * invoking suite's state dir (`.vueform/smoke/logs/`,
 * `.vueform/smoke-types/logs/`). Live repaint on a TTY, plain `[tag]` lines
 * otherwise (CI).
 */
import path from 'node:path'

import {
  createMatrix,
  createPaint,
  createRows,
  createRunLog,
  resolveTerminalMode,
  termLink as sharedTermLink,
  type Paint,
} from '../terminal'
import { smokeStateDir } from './lib'

export const STAGES = ['install', 'build', 'boot', 'interaction'] as const
export type StageName = (typeof STAGES)[number]
export const TYPES_STAGES = ['install', 'typecheck'] as const
export type TypesStageName = (typeof TYPES_STAGES)[number]
export type StageStatus = 'pending' | 'active' | 'pass' | 'fail' | 'skip'

// The smoke CLIs color their own summary lines after the display stops, so
// these helpers decide per call from the TTY (not from a display's mode).
const paint = (): Paint =>
  createPaint(Boolean(process.stdout.isTTY) && !('NO_COLOR' in process.env))

export const green = (t: string): string => paint().green(t)
export const red = (t: string): string => paint().red(t)
export const cyan = (t: string): string => paint().cyan(t)
export const dim = (t: string): string => paint().dim(t)
export const gray = (t: string): string => paint().gray(t)
export const bold = (t: string): string => paint().bold(t)

/**
 * An OSC 8 hyperlink wrapping the path itself, so terminals without OSC 8
 * support still show (and usually linkify) the plain absolute path.
 */
export function termLink(file: string): string {
  return sharedTermLink(file, { live: Boolean(process.stdout.isTTY) })
}

export interface SmokeLog {
  file: string
  /**
   * The `.errors.log` sibling path (written by the CLI on failures).
   */
  errorsFile: string
  write(text: string): void
  /**
   * A visual divider naming the step the following output belongs to.
   */
  section(title: string): void
  close(): void
}

/**
 * The adapter-prefixed session log (`<adapter>-<stamp>.log`): parallel
 * adapter invocations share one logs dir, and the shared run log prunes by
 * session age so one adapter's fresh logs survive another's run.
 */
export function createSmokeLog(
  root: string,
  adapter: string,
  stateDir = smokeStateDir(root)
): SmokeLog {
  const log = createRunLog({
    dir: path.join(stateDir, 'logs'),
    prefix: adapter,
  })
  return {
    file: log.file,
    errorsFile: log.errorsFile,
    write: log.write,
    section: log.section,
    close: log.close,
  }
}

export interface Display {
  /**
   * Transient status line shown above the matrix (packing, assembling, …).
   */
  phase(text: string | null): void
  stage(envId: string, stage: StageName, status: StageStatus): void
  /**
   * Final repaint + cursor restore. Leaves the finished matrix on screen.
   */
  stop(): void
}

export function createDisplay(opts: {
  adapter: string
  envIds: string[]
  live: boolean
}): Display {
  const matrix = createMatrix({
    title: 'Smoke tests',
    subtitle: opts.adapter,
    rows: opts.envIds,
    columns: STAGES,
    mode: resolveTerminalMode({ argv: [], live: opts.live }),
    tag: `smoke:${opts.adapter}`,
    phaseTag: 'smoke',
  })
  return {
    phase: matrix.phase,
    stage: matrix.cell,
    stop: matrix.finish,
  }
}

export type ListRowStatus = 'pending' | 'active' | 'pass' | 'fail' | 'skip'

export interface ListDisplay {
  /**
   * Transient status line shown below the rows (packing, assembling, …).
   */
  phase(text: string | null): void
  row(id: string, status: ListRowStatus, detail?: string): void
  /**
   * Final repaint + cursor restore. Leaves the finished rows on screen.
   */
  stop(): void
}

/**
 * The flat sibling of `createDisplay`: one live row per entry (spinner while
 * active with its current step as the detail, then ✓/✗/– plus the final
 * detail) instead of an env × stage matrix — the smoke-types suite's choice,
 * whose two stages don't earn a grid. Same TTY contract: live repaint on a
 * TTY, plain completion lines otherwise.
 */
export function createListDisplay(opts: {
  /**
   * The heading, e.g. "Smoke-types tests".
   */
  title: string
  /**
   * The non-live fallback's line prefix, e.g. "smoke-types".
   */
  tag: string
  adapter: string
  /**
   * Initial rows in display order (skipped entries arrive preset).
   */
  rows: { id: string; status?: ListRowStatus; detail?: string }[]
  live: boolean
}): ListDisplay {
  const rows = createRows({
    title: opts.title,
    subtitle: opts.adapter,
    rows: opts.rows,
    mode: resolveTerminalMode({ argv: [], live: opts.live }),
    tag: `${opts.tag}:${opts.adapter}`,
    phaseTag: opts.tag,
    timers: 'column',
  })
  return {
    phase: rows.phase,
    row(id, status, detail = '') {
      if (status === 'active') {
        rows.start(id)
        rows.progress(id, detail)
      } else if (status === 'pass') {
        rows.pass(id, detail)
      } else if (status === 'fail') {
        rows.fail(id, detail)
      } else if (status === 'skip') {
        rows.skip(id, detail)
      }
    },
    stop: rows.finish,
  }
}
