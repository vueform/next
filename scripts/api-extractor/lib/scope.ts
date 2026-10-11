import { adapters } from './adapters'

/**
 * Which sources a run covers: the core package and/or named adapters.
 * Selected by CLI flags:
 *
 * - `--adapter=x,y` / `-a=x,y` / `-A=x,y` the listed adapters only
 *
 * Without flags everything is in scope (core + every adapter).
 */
export interface ScrapeScope {
  core: boolean
  adapters: string[]
}

export function parseScope(argv: string[]): {
  scope: ScrapeScope
  rest: string[]
} {
  const names = Object.keys(adapters)

  let scoped = false
  const requested: string[] = []
  const rest: string[] = []

  for (const arg of argv) {
    if (
      arg.startsWith('--adapter=') ||
      arg.startsWith('-a=') ||
      arg.startsWith('-A=')
    ) {
      requested.push(
        ...arg
          .slice(arg.indexOf('=') + 1)
          .split(',')
          .filter(Boolean)
      )
      scoped = true
    } else {
      rest.push(arg)
    }
  }

  const unknown = requested.filter((name) => !names.includes(name))
  if (unknown.length) {
    throw new Error(
      `Unknown adapter(s): ${unknown.join(', ')} — available: ${names.join(', ')}`
    )
  }

  const scope: ScrapeScope = scoped
    ? { core: false, adapters: [...new Set(requested)] }
    : { core: true, adapters: names }

  return { scope, rest }
}
