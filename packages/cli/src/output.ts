/**
 * Output helper shared by all commands. `--silent` mutes informational output;
 * errors always print. `fail` is the single error format: an `error:` line plus
 * an optional indented hint, and a nonzero exit code.
 */
export interface Output {
  log(message?: string): void
  error(message: string): void
  fail(message: string, hint?: string): void
}

export function createOutput({ silent = false } = {}): Output {
  return {
    log(message = '') {
      if (!silent) console.log(message)
    },

    error(message: string) {
      console.error(message)
    },

    fail(message: string, hint?: string) {
      console.error(`error: ${message}`)

      if (hint) {
        console.error(
          hint
            .split('\n')
            .map((line) => `  ${line}`)
            .join('\n')
        )
      }

      process.exitCode = 1
    },
  }
}
