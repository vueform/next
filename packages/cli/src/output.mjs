/**
 * Output helper shared by all commands. `--silent` mutes informational output;
 * errors always print. `fail` is the single error format: an `error:` line plus
 * an optional indented hint, and a nonzero exit code.
 */
export function createOutput({ silent = false } = {}) {
  return {
    log(message = '') {
      if (!silent) console.log(message)
    },

    error(message) {
      console.error(message)
    },

    fail(message, hint) {
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
