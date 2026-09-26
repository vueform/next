/**
 * Output helper shared by all commands. `--silent` mutes informational output;
 * errors always print. `fail` is the single error format: an `error:` line plus
 * an optional indented hint, and a nonzero exit code.
 */

// Colors only on a TTY, and never with NO_COLOR set — piped/CI output stays
// plain.
const canColor = () =>
  process.stdout.isTTY === true && process.env.NO_COLOR === undefined

const paint = (code: string) => (text: string) =>
  canColor() ? `\x1b[${code}m${text}\x1b[0m` : text

export const green = paint('32')
export const yellow = paint('33')
export const red = paint('31')
export const dim = paint('2')

const ACTION_COLORS: Record<string, (text: string) => string> = {
  Created: green,
  Updated: yellow,
  Overwrote: yellow,
  Removed: red,
}

export interface Output {
  log(message?: string): void
  error(message: string): void
  fail(message: string, hint?: string): void
}

/**
 * One action line (`Created path`): the label padded to the shared column width
 * and colored by verb — created green, updated/overwrote yellow, removed red;
 * unknown labels stay plain.
 */
export function actionLine(label: string, target: string) {
  const color = ACTION_COLORS[label] ?? ((text: string) => text)

  return `${color(label)}${' '.repeat(Math.max(12 - label.length, 1))}${target}`
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
