import { adapters } from './adapters'

/**
 * Which sources a run covers: the core package and/or named adapters. Selected
 * by CLI flags, shared by `pnpm extract` and `pnpm extract:validate`:
 *
 * - `--core` core only
 * - `--adapter=x,y` / `-a=x,y` the listed adapters
 * - `--ui`, `--pv` / `--primevue` shorthands for `--adapter=ui` / `=primevue`
 *
 * Without flags everything is in scope. Flags combine (`--core --pv`).
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

  let core = false
  let scoped = false
  const requested: string[] = []
  const rest: string[] = []

  for (const arg of argv) {
    if (arg === '--core') {
      core = true
      scoped = true
    } else if (arg === '--ui') {
      requested.push('ui')
      scoped = true
    } else if (arg === '--pv' || arg === '--primevue') {
      requested.push('primevue')
      scoped = true
    } else if (arg.startsWith('--adapter=') || arg.startsWith('-a=')) {
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
    ? { core, adapters: [...new Set(requested)] }
    : { core: true, adapters: names }

  return { scope, rest }
}
