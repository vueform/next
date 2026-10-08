/**
 * The per-adapter smoke CLI (`pnpm --filter @vueform/<adapter> test:smoke
 * ...`). `--env <name>` / `-E <name>` selects a single env from the fixed
 * set (see envs.ts); without it every env runs. `--build` / `-B` builds
 * core and the current adapter first. Every run packs fresh tarballs and
 * runs all tiers headless with pnpm as the fixture installer.
 */
import path from 'node:path'

import { fixtureDir } from './assemble'
import {
  bold,
  createDisplay,
  createSmokeLog,
  dim,
  green,
  red,
  termLink,
} from './display'
import { ENVS, type EnvDef } from './envs'
import {
  exists,
  findRepoRoot,
  readJson,
  run,
  smokeStateDir,
  SmokeError,
} from './lib'
import { packWorkspace } from './pack'
import { runEnv, type EnvResult } from './runner'

interface ParsedArgs {
  /**
   * The single env id to run (`--env` / `-E`), or undefined for all envs.
   */
  env?: string
  /**
   * Build core and the current adapter before packing (`--build` / `-B`).
   */
  build: boolean
}

export interface SmokeCliOptions {
  /**
   * The adapter package dir. Defaults to cwd (`pnpm run` sets it).
   */
  adapterDir?: string
}

function helpText(adapter: string): string {
  const envRows = ENVS.map(
    (e) =>
      `  ${e.id.padEnd(10)} framework=${e.framework.padEnd(5)} rendering=${e.rendering.padEnd(4)} mode=${e.mode.padEnd(6)} ${e.note}`
  ).join('\n')

  return `Smoke tests for @vueform/${adapter} — proves the packed tarballs work in real project setups.

Usage: pnpm --filter @vueform/${adapter} test:smoke [--env <name>] [--build]

Envs (each is one project setup, run from packed tarballs):
${envRows}

Options:
  --env <name>, -E, -e      run only that env (default: all of them)
  --build, -B, -b           build @vueform/core and this adapter first
  --help                    this text

All child-process output is captured into .vueform/smoke/logs/; the run ends
with a link to the log file.
`
}

function parseArgs(argv: string[], adapter: string): ParsedArgs | null {
  let env: string | undefined
  let build = false

  const envIds = ENVS.map((e) => e.id)
  const setEnv = (value: string | undefined, arg: string) => {
    if (value === undefined) {
      throw new SmokeError(
        `${arg} needs an env name (one of: ${envIds.join(', ')}).`
      )
    }
    if (!envIds.includes(value)) {
      throw new SmokeError(
        `Unknown env "${value}" (one of: ${envIds.join(', ')}).`
      )
    }
    if (env !== undefined && env !== value) {
      throw new SmokeError(`--env given twice (${env} and ${value}).`)
    }
    env = value
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    if (arg === '--help' || arg === '-h') {
      console.log(helpText(adapter))
      return null
    }

    // Accepts both `--env name` and `--env=name` (same for -E/-e).
    if (arg === '--env' || arg === '-E' || arg === '-e') {
      setEnv(argv[++i], arg)
      continue
    }
    if (
      arg.startsWith('--env=') ||
      arg.startsWith('-E=') ||
      arg.startsWith('-e=')
    ) {
      setEnv(arg.split('=', 2)[1], arg)
      continue
    }

    if (arg === '--build' || arg === '-B' || arg === '-b') {
      build = true
      continue
    }

    throw new SmokeError(`Unknown argument: ${arg}\n\n${helpText(adapter)}`)
  }

  return { env, build }
}

const fmtDuration = (ms: number) => {
  const s = Math.round(ms / 1000)
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`
}

async function main(options: SmokeCliOptions) {
  const adapterDir = path.resolve(options.adapterDir ?? process.cwd())
  const pkg = readJson(path.join(adapterDir, 'package.json'))
  const adapter = path.basename(adapterDir)
  const root = findRepoRoot(adapterDir)

  const parsed = parseArgs(process.argv.slice(2), adapter)
  if (!parsed) return

  const selected = parsed.env
    ? ENVS.filter((env) => env.id === parsed.env)
    : ENVS

  // Envs without a committed fixture: hard error when explicitly selected,
  // skip with a note on "run everything" invocations.
  const runnable: EnvDef[] = []
  const results: EnvResult[] = []

  for (const env of selected) {
    if (exists(fixtureDir(adapterDir, env))) {
      runnable.push(env)
    } else if (parsed.env) {
      throw new SmokeError(
        `Env "${env.id}" has no fixture at packages/${adapter}/tests/smoke/${env.fixture}.`
      )
    } else {
      results.push({ adapter, env, status: 'skip', detail: 'no fixture yet' })
    }
  }

  if (!runnable.length) {
    throw new SmokeError(
      `No smoke fixtures exist yet under packages/${adapter}/tests/smoke/.`
    )
  }

  const stateDir = smokeStateDir(root)
  const log = createSmokeLog(root, adapter)
  const display = createDisplay({
    adapter: pkg.name ?? adapter,
    pm: 'pnpm',
    envIds: runnable.map((e) => e.id),
    live: Boolean(process.stdout.isTTY),
  })
  const durations = new Map<string, number>()

  try {
    if (parsed.build) {
      log.section('build')
      for (const name of ['@vueform/core', pkg.name]) {
        display.phase(`building ${name}…`)
        await run('pnpm', ['--filter', name, 'run', 'build'], {
          cwd: root,
          log: log.write,
          fail: `Building ${name} failed`,
        })
      }
    }

    display.phase('packing tarballs…')
    log.section('pack')
    const tarballs = await packWorkspace(
      root,
      path.join(stateDir, 'tarballs'),
      {
        log: log.write,
        onStatus: display.phase,
      }
    )
    display.phase(null)

    for (const env of runnable) {
      const started = Date.now()
      try {
        await runEnv({
          root,
          adapter,
          adapterDir,
          env,
          tarballs,
          runsDir: path.join(stateDir, 'runs'),
          log: log.write,
          report: (stage, status) => display.stage(env.id, stage, status),
        })
        results.push({ adapter, env, status: 'pass' })
      } catch (error) {
        if (!(error instanceof SmokeError)) throw error
        log.write(`FAILED: ${error.message}`)
        results.push({
          adapter,
          env,
          status: 'fail',
          detail: error.message,
          stage: (error as SmokeError & { stage?: EnvResult['stage'] }).stage,
          logTail: error.logTail,
        })
      }
      durations.set(env.id, Date.now() - started)
    }
  } finally {
    display.stop()
    log.close()
  }

  const failures = results.filter((r) => r.status === 'fail')

  console.log(`\n${bold('[smoke] Summary:')}`)
  for (const r of results) {
    const mark =
      r.status === 'pass'
        ? green('✓')
        : r.status === 'fail'
          ? red('✗')
          : dim('–')
    const time = durations.has(r.env.id)
      ? dim(` (${fmtDuration(durations.get(r.env.id)!)})`)
      : ''
    const where = r.status === 'fail' && r.stage ? dim(` — ${r.stage}`) : ''
    const skip = r.status === 'skip' ? dim(` — ${r.detail}`) : ''
    console.log(`  ${mark} ${r.env.id}${time}${where}${skip}`)
  }

  if (failures.length) {
    console.log(
      `\n${red(`${failures.length} of ${results.length - results.filter((r) => r.status === 'skip').length} envs failed.`)}`
    )
    for (const f of failures) {
      console.log(
        `\n${red('✗')} ${bold(`${f.adapter}:${f.env.id}`)}${f.stage ? ` — ${f.stage}` : ''}`
      )
      console.log(`  ${f.detail}`)
      if (f.logTail) {
        console.log(dim(f.logTail.replace(/^/gm, '  │ ')))
      }
    }
  }

  console.log(`\nFull log: ${termLink(log.file)}`)

  if (failures.length) process.exit(1)
}

export async function runSmokeCli(
  options: SmokeCliOptions = {}
): Promise<void> {
  try {
    await main(options)
  } catch (error) {
    if (error instanceof SmokeError) {
      console.error(`\n[smoke] ${error.message}`)
      process.exit(1)
    }
    throw error
  }
}
