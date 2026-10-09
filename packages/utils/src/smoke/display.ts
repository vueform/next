/**
 * Terminal UI + log capture for the smoke harness. Child-process output goes
 * to a per-invocation log file under the invoking suite's state dir
 * (`.vueform/smoke/logs/`, `.vueform/smoke-types/logs/`); the terminal
 * shows a live env × stage matrix instead (spinner while a stage runs,
 * green ✓ / red ✗ / dim – per result), with a plain-line fallback when stdout
 * is not a TTY (CI).
 */
import fs from 'node:fs'
import path from 'node:path'

import { smokeStateDir } from './lib'

export const STAGES = ['install', 'build', 'boot', 'interaction'] as const
export type StageName = (typeof STAGES)[number]
export const TYPES_STAGES = ['install', 'typecheck'] as const
export type TypesStageName = (typeof TYPES_STAGES)[number]
export type StageStatus = 'pending' | 'active' | 'pass' | 'fail' | 'skip'

const KEPT_LOGS = 20
const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

const colorsEnabled = () => process.stdout.isTTY && !('NO_COLOR' in process.env)

const paint = (code: string, text: string) =>
  colorsEnabled() ? `\x1b[${code}m${text}\x1b[0m` : text

export const green = (t: string) => paint('32', t)
export const red = (t: string) => paint('31', t)
export const cyan = (t: string) => paint('36', t)
export const dim = (t: string) => paint('2', t)
export const gray = (t: string) => paint('90', t)
export const bold = (t: string) => paint('1', t)

/**
 * An OSC 8 hyperlink wrapping the path itself, so terminals without OSC 8
 * support still show (and usually linkify) the plain absolute path.
 */
export function termLink(file: string): string {
  if (!process.stdout.isTTY) return file
  return `\x1b]8;;file://${file}\x1b\\${file}\x1b]8;;\x1b\\`
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

export function createSmokeLog(
  root: string,
  adapter: string,
  stateDir = smokeStateDir(root)
): SmokeLog {
  const dir = path.join(stateDir, 'logs')
  fs.mkdirSync(dir, { recursive: true })

  // Keep the directory from growing without bound — prune by session (a run
  // writes up to two files sharing a `<adapter>-<stamp>` prefix).
  const prefixes = [
    ...new Set(
      fs
        .readdirSync(dir)
        .filter((f) => f.endsWith('.log'))
        .map((f) => f.split('.')[0])
    ),
  ].sort()
  for (const old of prefixes.slice(0, -KEPT_LOGS + 1)) {
    for (const f of fs.readdirSync(dir)) {
      if (f.startsWith(`${old}.`)) fs.rmSync(path.join(dir, f), { force: true })
    }
  }

  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\..+/, '')
    .replace('T', '-')
  const file = path.join(dir, `${adapter}-${stamp}.log`)
  const errorsFile = path.join(dir, `${adapter}-${stamp}.errors.log`)
  // Synchronous writes: the harness itself is synchronous (spawnSync), and a
  // buffered stream would lose its tail to the process.exit(1) after the
  // summary.
  const fd = fs.openSync(file, 'w')

  return {
    file,
    errorsFile,
    write: (text) => {
      if (text) fs.writeSync(fd, text.endsWith('\n') ? text : text + '\n')
    },
    section: (title) => fs.writeSync(fd, `\n––––– ${title} –––––\n`),
    close: () => fs.closeSync(fd),
  }
}

const GLYPH: Record<StageStatus, string> = {
  pending: '·',
  active: '', // spinner frame, filled in at render time
  pass: '✓',
  fail: '✗',
  skip: '–',
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
  const grid = new Map<string, Map<StageName, StageStatus>>()
  for (const id of opts.envIds) {
    grid.set(id, new Map(STAGES.map((s) => [s, 'pending'])))
  }

  let phaseText: string | null = null

  if (!opts.live) {
    return {
      phase(text) {
        phaseText = text
        if (text) console.log(`[smoke] ${text}`)
      },
      stage(envId, stage, status) {
        grid.get(envId)!.set(stage, status)
        if (status === 'pass' || status === 'fail') {
          console.log(
            `[smoke:${opts.adapter}:${envId}] ${stage} ${status === 'pass' ? '✓' : '✗'}`
          )
        }
      },
      stop() {},
    }
  }

  const envWidth = Math.max(...opts.envIds.map((id) => id.length), 4) + 2
  let tick = 0
  let printedLines = 0

  const renderLines = (): string[] => {
    const spin = SPINNER[tick % SPINNER.length]
    const lines: string[] = []
    lines.push(bold('Smoke tests ') + gray(`(${opts.adapter})`))
    lines.push(
      dim(
        '  ' +
          'env'.padEnd(envWidth) +
          STAGES.map((s) => s.padStart(s.length).padEnd(13)).join('')
      )
    )
    for (const [id, stages] of grid) {
      let row = '  ' + id.padEnd(envWidth)
      for (const stage of STAGES) {
        const status = stages.get(stage)!
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
        const pad = Math.floor(stage.length / 2)
        row += ' '.repeat(pad) + colored + ' '.repeat(13 - pad - 1)
      }
      lines.push(row)
    }
    if (phaseText)
      lines.push(dim(`  ${SPINNER[tick % SPINNER.length]} ${phaseText}`))
    return lines
  }

  const repaint = () => {
    const lines = renderLines()
    let out = ''
    if (printedLines > 0) out += `\x1b[${printedLines}A`
    for (const line of lines) out += `\x1b[2K${line}\n`
    // A shrinking frame (phase line disappearing) leaves stale lines behind.
    for (let i = lines.length; i < printedLines; i++) out += '\x1b[2K\n'
    if (printedLines > lines.length) {
      out += `\x1b[${printedLines - lines.length}A`
    }
    process.stdout.write(out)
    printedLines = lines.length
  }

  process.stdout.write('\x1b[?25l')
  const timer = setInterval(() => {
    tick++
    repaint()
  }, 100)
  repaint()

  const restoreCursor = () => process.stdout.write('\x1b[?25h')
  process.on('exit', restoreCursor)

  return {
    phase(text) {
      phaseText = text
      repaint()
    },
    stage(envId, stage, status) {
      grid.get(envId)!.set(stage, status)
      repaint()
    },
    stop() {
      clearInterval(timer)
      phaseText = null
      repaint()
      restoreCursor()
      process.removeListener('exit', restoreCursor)
    },
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
  const rows = new Map(
    opts.rows.map((row) => [
      row.id,
      {
        status: row.status ?? ('pending' as ListRowStatus),
        detail: row.detail ?? '',
      },
    ])
  )

  const glyph = (status: ListRowStatus, spin: string) =>
    status === 'active'
      ? cyan(spin)
      : status === 'pass'
        ? green('✓')
        : status === 'fail'
          ? red('✗')
          : dim(status === 'skip' ? '–' : '·')

  const detailText = (status: ListRowStatus, detail: string) =>
    !detail
      ? ''
      : status === 'fail'
        ? red(detail)
        : status === 'pass'
          ? green(detail)
          : dim(detail)

  if (!opts.live) {
    for (const [id, row] of rows) {
      if (row.status === 'skip') {
        console.log(`[${opts.tag}:${opts.adapter}:${id}] – ${row.detail}`)
      }
    }
    return {
      phase(text) {
        if (text) console.log(`[${opts.tag}] ${text}`)
      },
      row(id, status, detail = '') {
        rows.get(id)!.status = status
        rows.get(id)!.detail = detail
        if (status === 'pass' || status === 'fail') {
          console.log(
            `[${opts.tag}:${opts.adapter}:${id}] ${status === 'pass' ? '✓' : '✗'}${detail ? ` ${detail}` : ''}`
          )
        }
      },
      stop() {},
    }
  }

  const idWidth = Math.max(...[...rows.keys()].map((id) => id.length), 4) + 2
  let phaseText: string | null = null
  let tick = 0
  let printedLines = 0

  const renderLines = (): string[] => {
    const spin = SPINNER[tick % SPINNER.length]
    const lines: string[] = []
    lines.push(bold(`${opts.title} `) + gray(`(${opts.adapter})`))
    for (const [id, row] of rows) {
      lines.push(
        `  ${glyph(row.status, spin)} ${id.padEnd(idWidth)}${detailText(row.status, row.detail)}`
      )
    }
    if (phaseText) lines.push(dim(`  ${spin} ${phaseText}`))
    return lines
  }

  const repaint = () => {
    const lines = renderLines()
    let out = ''
    if (printedLines > 0) out += `\x1b[${printedLines}A`
    for (const line of lines) out += `\x1b[2K${line}\n`
    // A shrinking frame (phase line disappearing) leaves stale lines behind.
    for (let i = lines.length; i < printedLines; i++) out += '\x1b[2K\n'
    if (printedLines > lines.length) {
      out += `\x1b[${printedLines - lines.length}A`
    }
    process.stdout.write(out)
    printedLines = lines.length
  }

  process.stdout.write('\x1b[?25l')
  const timer = setInterval(() => {
    tick++
    repaint()
  }, 100)
  repaint()

  const restoreCursor = () => process.stdout.write('\x1b[?25h')
  process.on('exit', restoreCursor)

  return {
    phase(text) {
      phaseText = text
      repaint()
    },
    row(id, status, detail = '') {
      const row = rows.get(id)!
      row.status = status
      row.detail = detail
      repaint()
    },
    stop() {
      clearInterval(timer)
      phaseText = null
      repaint()
      restoreCursor()
      process.removeListener('exit', restoreCursor)
    },
  }
}
