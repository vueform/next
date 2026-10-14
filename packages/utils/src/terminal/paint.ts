/**
 * Color and link helpers shared by every terminal runner. All of them take an
 * explicit `enabled` switch (from {@link TerminalMode}) instead of probing the
 * process, so the same code renders live frames and plain CI lines.
 */
import type { TerminalMode } from './mode'

export interface Paint {
  green(t: string): string
  red(t: string): string
  yellow(t: string): string
  cyan(t: string): string
  gray(t: string): string
  dim(t: string): string
  bold(t: string): string
}

export function createPaint(enabled: boolean): Paint {
  const paint = (code: string, text: string) =>
    enabled ? `\x1b[${code}m${text}\x1b[0m` : text
  return {
    green: (t) => paint('32', t),
    red: (t) => paint('31', t),
    yellow: (t) => paint('33', t),
    cyan: (t) => paint('36', t),
    gray: (t) => paint('90', t),
    dim: (t) => paint('2', t),
    bold: (t) => paint('1', t),
  }
}

export const ansiRe = new RegExp(String.raw`\x1b\[[0-9;]*m`, 'g')

export const stripAnsi = (text: string): string => text.replace(ansiRe, '')

/**
 * An OSC 8 hyperlink wrapping the path itself, so terminals without OSC 8
 * support still show (and usually linkify) the plain absolute path. Plain
 * path when the run is not live (piped output, CI).
 */
export function termLink(
  file: string,
  mode: Pick<TerminalMode, 'live'>
): string {
  return mode.live ? `\x1b]8;;file://${file}\x1b\\${file}\x1b]8;;\x1b\\` : file
}
