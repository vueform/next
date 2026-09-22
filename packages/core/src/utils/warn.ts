/**
 * Emits a framework warning with the standard `[Vueform warn]: ` prefix, so
 * every warning is greppable and consistently branded. Call sites keep their
 * own `isDev()` guards — the guard stays inline so bundlers can drop the entire
 * branch (message strings included) from production builds.
 *
 * @param message The warning message, without the prefix.
 * @param args Extra values forwarded to `console.warn` (e.g. an error).
 */
export function warn(message: string, ...args: unknown[]): void {
  console.warn(`[Vueform warn]: ${message}`, ...args)
}
