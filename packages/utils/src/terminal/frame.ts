/**
 * The live repaint engine: a block of lines rewritten in place (cursor up +
 * clear per line, shrink-safe), a shared spinner ticking at 100ms, and cursor
 * hide/restore wired to both normal exit and SIGINT/SIGTERM. One frame per
 * display; `done()` leaves the final frame on screen.
 */
import { onCleanup } from './cleanup'

export const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

export interface Frame {
  /**
   * The current spinner glyph — render functions read it per repaint.
   */
  spin(): string
  repaint(): void
  /**
   * Hides the cursor, paints the first frame and starts the spinner tick.
   */
  start(): void
  /**
   * Stops the tick and restores the cursor. Idempotent; callers repaint their
   * final state first.
   */
  done(): void
}

export function createFrame(
  render: () => string[],
  stream: NodeJS.WriteStream = process.stdout
): Frame {
  let tick = 0
  let printedLines = 0
  let timer: ReturnType<typeof setInterval> | undefined
  let finished = false
  const restoreCursor = () => stream.write('\x1b[?25h')
  let offCleanup: (() => void) | undefined

  const repaint = () => {
    const lines = render()
    let out = ''
    if (printedLines > 0) out += `\x1b[${printedLines}A`
    for (const line of lines) out += `\x1b[2K${line}\n`
    // A shrinking frame (phase line disappearing) leaves stale lines behind.
    for (let i = lines.length; i < printedLines; i++) out += '\x1b[2K\n'
    if (printedLines > lines.length) {
      out += `\x1b[${printedLines - lines.length}A`
    }
    stream.write(out)
    printedLines = lines.length
  }

  return {
    spin: () => SPINNER[tick % SPINNER.length],
    repaint,
    start() {
      stream.write('\x1b[?25l')
      process.on('exit', restoreCursor)
      offCleanup = onCleanup(restoreCursor)
      timer = setInterval(() => {
        tick++
        repaint()
      }, 100)
      repaint()
    },
    done() {
      if (finished) return
      finished = true
      if (timer) clearInterval(timer)
      restoreCursor()
      process.removeListener('exit', restoreCursor)
      offCleanup?.()
    },
  }
}
