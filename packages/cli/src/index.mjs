import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { parseArgs } from './args.mjs'
import { commands } from './commands/index.mjs'
import { createOutput } from './output.mjs'
import { closePrompts } from './prompt.mjs'

const pkgPath = fileURLToPath(new URL('../package.json', import.meta.url))

const COMMON_FLAGS = [
  ['--cwd <path>', 'Run as if the CLI was started in <path>'],
  ['--silent', 'Suppress non-essential output'],
  ['-h, --help', 'Show help'],
]

export function version() {
  return JSON.parse(readFileSync(pkgPath, 'utf8')).version
}

function flagRows(rows) {
  const pad = Math.max(...rows.map(([flag]) => flag.length)) + 2

  return rows.map(
    ([flag, description]) => `  ${flag.padEnd(pad)}${description}`
  )
}

export function printHelp() {
  const rows = Object.values(commands)
  const pad = Math.max(...rows.map((c) => c.usage.length)) + 2

  console.log(
    [
      `vueform v${version()}`,
      '',
      'Usage: vueform <command> [options]',
      '',
      'Commands:',
      ...rows.map((c) => `  ${c.usage.padEnd(pad)}${c.description}`),
      '',
      'Options:',
      ...flagRows([
        ['-v, --version', 'Print the CLI version'],
        ...COMMON_FLAGS,
      ]),
      '',
      'Run `vueform help <command>` for details on a command.',
    ].join('\n')
  )
}

export function printCommandHelp(command) {
  const lines = [
    `Usage: vueform ${command.usage}`,
    '',
    `${command.description}`,
  ]

  const flags = [...(command.flags ?? []), ...COMMON_FLAGS]

  lines.push('', 'Options:', ...flagRows(flags))

  if (command.examples?.length) {
    lines.push('', 'Examples:', ...command.examples.map((e) => `  $ ${e}`))
  }

  console.log(lines.join('\n'))
}

/**
 * CLI entry point. `argv` is the raw argument list without the node/script
 * prefix (i.e. `process.argv.slice(2)`).
 */
export async function run(argv) {
  const [name, ...rest] = argv

  if (!name || name === '--help' || name === '-h') {
    printHelp()
    return
  }

  if (name === '--version' || name === '-v') {
    console.log(version())
    return
  }

  if (name === 'help') {
    const target = commands[rest[0]]
    if (target) printCommandHelp(target)
    else printHelp()
    return
  }

  const command = commands[name]

  if (!command) {
    console.error(`Unknown command: ${name}\n`)
    printHelp()
    process.exitCode = 1
    return
  }

  if (rest.includes('--help') || rest.includes('-h')) {
    printCommandHelp(command)
    return
  }

  const { positionals, flags } = parseArgs(rest, {
    valueFlags: [...(command.valueFlags ?? []), 'cwd'],
  })

  const out = createOutput({ silent: flags.silent === true })

  if (typeof flags.cwd === 'string') {
    if (!existsSync(flags.cwd)) {
      out.fail(`--cwd path does not exist: ${flags.cwd}`)
      return
    }

    process.chdir(flags.cwd)
  }

  try {
    await command.run({ positionals, flags, out })
  } finally {
    closePrompts()
  }
}
