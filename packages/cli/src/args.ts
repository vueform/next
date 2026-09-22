/**
 * Minimal argument parser: splits `args` into positionals and `--flag`s.
 * `--flag=value` always captures the value; a flag listed in
 * `options.valueFlags` also consumes the next argument as its value (`--flag
 * value`); any other `--flag` is `true`.
 */
export interface ParsedArgs {
  positionals: string[]
  flags: Record<string, string | boolean>
}

export function parseArgs(
  args: string[],
  options: { valueFlags?: string[] } = {}
): ParsedArgs {
  const valueFlags = new Set(options.valueFlags ?? [])
  const positionals: string[] = []
  const flags: Record<string, string | boolean> = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (!arg.startsWith('--')) {
      positionals.push(arg)
      continue
    }

    const eq = arg.indexOf('=')

    if (eq !== -1) {
      flags[arg.slice(2, eq)] = arg.slice(eq + 1)
      continue
    }

    const name = arg.slice(2)
    const next = args[i + 1]

    if (valueFlags.has(name) && next !== undefined && !next.startsWith('--')) {
      flags[name] = args[++i]
    } else {
      flags[name] = true
    }
  }

  return { positionals, flags }
}
