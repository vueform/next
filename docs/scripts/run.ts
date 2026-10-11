import { spawn, type ChildProcess } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ---------------------------------------------------------------------------
// Adapter-aware runner for vitepress dev/build/preview.
//
//   tsx scripts/run.ts <dev|build|preview|pre> [flags]  (pre = build + preview)
//
//   --adapter=ui,primevue  -a=ui,primevue   run for the listed adapters
//   --ui  --primevue  --pv                  adapter keys/aliases as flags
//
// Adapters (and their aliases) come from docs/config.json. With no flags,
// only the ui adapter runs.
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS_DIR = path.resolve(__dirname, '..')

interface AdapterDef {
  displayName?: string
  alias?: string[]
  disabled?: boolean
  devPort?: number
}

const docsConfig = JSON.parse(
  fs.readFileSync(path.join(DOCS_DIR, 'config.json'), 'utf-8')
)
const ADAPTERS: Record<string, AdapterDef> = docsConfig.adapters ?? {}

// name/alias -> adapter key
const NAME_TO_KEY: Record<string, string> = {}
for (const [key, def] of Object.entries(ADAPTERS)) {
  NAME_TO_KEY[key] = key
  for (const alias of def.alias ?? []) NAME_TO_KEY[alias] = key
}

const COLORS = ['\x1b[36m', '\x1b[35m', '\x1b[33m', '\x1b[32m', '\x1b[34m']
const RESET = '\x1b[0m'

function usage(error?: string): never {
  if (error) console.error(`\x1b[31m${error}${RESET}\n`)
  const names = Object.entries(ADAPTERS)
    .map(([key, def]) => [key, ...(def.alias ?? [])].join(' | '))
    .join(', ')
  console.error(
    [
      'Usage: pnpm <dev|build|preview|pre> [flags]',
      '',
      '  pre = build + preview',
      '',
      '  --adapter=<list>, -a=<list>, -A=<list>   comma-separated adapter names',
      '  --<adapter>                   adapter name or alias as a flag',
      '',
      `Adapters: ${names}`,
      'No flags: runs the ui adapter.',
    ].join('\n')
  )
  process.exit(1)
}

function parseArgs(argv: string[]): { command: string; keys: string[] } {
  const [command, ...rest] = argv
  if (!command || !['dev', 'build', 'preview', 'pre'].includes(command)) {
    usage(`Unknown or missing command: ${command ?? '(none)'}`)
  }

  const requested: string[] = []
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i]
    let value: string | undefined

    if (arg === '--adapter' || arg === '-a' || arg === '-A') {
      value = rest[++i]
      if (!value) usage(`Missing value for ${arg}`)
    } else if (
      arg.startsWith('--adapter=') ||
      arg.startsWith('-a=') ||
      arg.startsWith('-A=')
    ) {
      value = arg.slice(arg.indexOf('=') + 1)
    } else if (arg.startsWith('--')) {
      value = arg.slice(2)
    } else {
      // bare word, e.g. `pnpm dev ui`
      value = arg
    }

    for (const name of value
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean)) {
      const key = NAME_TO_KEY[name]
      if (!key) usage(`Unknown adapter: ${name}`)
      if (!requested.includes(key)) requested.push(key)
    }
  }

  if (requested.length) return { command, keys: requested }

  const fallback = 'ui' in ADAPTERS ? 'ui' : Object.keys(ADAPTERS)[0]
  if (!fallback) usage('No adapters in config.json')
  return { command, keys: [fallback] }
}

function vitepressArgs(command: string, key: string): string[] {
  const args = [command]
  if (command !== 'build') {
    const port = ADAPTERS[key].devPort
    if (port) args.push('--port', String(port))
  }
  return args
}

function spawnAdapter(
  command: string,
  key: string,
  prefix: string | null
): ChildProcess {
  const child = spawn('vitepress', vitepressArgs(command, key), {
    cwd: DOCS_DIR,
    env: {
      ...process.env,
      VF_ADAPTER: key,
      NODE_OPTIONS: '--max-old-space-size=8192',
      ...(prefix ? { FORCE_COLOR: '1' } : {}),
    },
    stdio: prefix ? ['inherit', 'pipe', 'pipe'] : 'inherit',
  })

  if (prefix) {
    const forward = (from: NodeJS.ReadableStream, to: NodeJS.WriteStream) => {
      let buffer = ''
      from.on('data', (chunk: Buffer) => {
        buffer += chunk.toString()
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) to.write(`${prefix} ${line}\n`)
      })
      from.on('end', () => {
        if (buffer) to.write(`${prefix} ${buffer}\n`)
      })
    }
    forward(child.stdout!, process.stdout)
    forward(child.stderr!, process.stderr)
  }

  return child
}

async function runParallel(command: string, keys: string[]): Promise<void> {
  const children = keys.map((key, i) => {
    const prefix =
      keys.length > 1 ? `${COLORS[i % COLORS.length]}[${key}]${RESET}` : null
    return spawnAdapter(command, key, prefix)
  })

  const killAll = () => children.forEach((child) => child.kill('SIGINT'))
  process.on('SIGINT', killAll)
  process.on('SIGTERM', killAll)

  const codes = await Promise.all(
    children.map(
      (child) =>
        new Promise<number>((resolve) =>
          child.on('close', (code) => resolve(code ?? 0))
        )
    )
  )
  process.exit(codes.find((code) => code !== 0) ?? 0)
}

async function runSequential(command: string, keys: string[]): Promise<void> {
  for (const key of keys) {
    console.log(
      `\n${COLORS[0]}Building ${ADAPTERS[key].displayName ?? key} (${key})...${RESET}`
    )
    const code = await new Promise<number>((resolve) => {
      spawnAdapter(command, key, null).on('close', (code) => resolve(code ?? 0))
    })
    if (code !== 0) process.exit(code)
  }
}

async function main(): Promise<void> {
  const { command, keys } = parseArgs(process.argv.slice(2))
  if (command === 'build') {
    await runSequential('build', keys)
  } else if (command === 'pre') {
    await runSequential('build', keys)
    await runParallel('preview', keys)
  } else {
    await runParallel(command, keys)
  }
}

main()
