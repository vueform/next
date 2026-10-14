/**
 * The shared display-mode decision for every terminal runner: `live` (repaint
 * a spinner frame in place) only on a TTY, with `--verbose` (raw output per
 * step) and `--ci` (completion lines only, even on a TTY) forcing the plain
 * mode. Colors follow `live` and honor `NO_COLOR`.
 */
export interface TerminalMode {
  /**
   * Repaint-in-place rendering (spinner, live counters).
   */
  live: boolean
  /**
   * Raw output per step instead of row lines (`--verbose`).
   */
  verbose: boolean
  /**
   * Completion lines only, forced even on a TTY (`--ci`).
   */
  ci: boolean
  colors: boolean
}

export function resolveTerminalMode(
  opts: {
    /**
     * Where the display flags come from — pass `[]` for runners whose own
     * argv parsing rejects unknown flags (bench).
     */
    argv?: string[]
    stream?: NodeJS.WriteStream
    /**
     * Explicit liveness override (smoke passes its own TTY decision).
     */
    live?: boolean
    env?: NodeJS.ProcessEnv
  } = {}
): TerminalMode {
  const argv = opts.argv ?? process.argv
  const stream = opts.stream ?? process.stdout
  const env = opts.env ?? process.env
  const verbose = argv.includes('--verbose')
  const ci = argv.includes('--ci')
  const live = (opts.live ?? Boolean(stream.isTTY)) && !verbose && !ci
  return { live, verbose, ci, colors: live && !('NO_COLOR' in env) }
}

/**
 * Display flags the runners consume from `process.argv` themselves — callers
 * that treat their remaining args as task selectors strip these first.
 */
export const stripDisplayFlags = (args: string[]): string[] =>
  args.filter((arg) => arg !== '--verbose' && arg !== '--ci')
