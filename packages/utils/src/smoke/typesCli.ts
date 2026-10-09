/**
 * The per-adapter smoke-types CLI (`pnpm --filter @vueform/<adapter>
 * test-smoke-types ...`). Mirrors the smoke CLI's flag model over the types
 * env set (see typesEnvs.ts): `--env <name>` selects one env, `--build`
 * builds first, every run packs fresh tarballs unless `--nopack` reuses the
 * previous ones. Kept separate from the smoke CLI on purpose — smoke proves
 * the runtime, this proves the shipped types — but both consume the same
 * tarballs and committed fixtures.
 */
import { writeFileSync } from 'node:fs'
import path from 'node:path'

import { fixtureDir } from './assemble'
import {
  createListDisplay,
  createSmokeLog,
  green,
  red,
  termLink,
} from './display'
import {
  exists,
  findRepoRoot,
  readJson,
  run,
  smokeTypesStateDir,
  SmokeError,
  tarballsDir,
} from './lib'
import { packWorkspace } from './pack'
import { TYPE_ENVS, type TypeEnvDef } from './typesEnvs'
import { runTypesEnv, type TypesEnvResult } from './typesRunner'

interface ParsedArgs {
  /**
   * The single env id to run (`--env` / `-E`), or undefined for all envs.
   */
  env?: string
  /**
   * Build core and the current adapter before packing (`--build` / `-B`).
   */
  build: boolean
  /**
   * Reuse the previously packed tarballs (`--nopack`).
   */
  nopack: boolean
  /**
   * Run the envs one after another instead of in parallel
   * (`--sequential`).
   */
  sequential: boolean
}

export interface SmokeTypesCliOptions {
  /**
   * The adapter package dir. Defaults to cwd (`pnpm run` sets it).
   */
  adapterDir?: string
}

function helpText(adapter: string): string {
  const envRows = TYPE_ENVS.map(
    (e) =>
      `  ${e.id.padEnd(14)} fixture=${e.fixture.padEnd(5)} check=${e.check.padEnd(9)} ${e.note}`
  ).join('\n')

  return `Smoke-types tests for @vueform/${adapter} — proves the packed tarballs' TYPES work in real consumer setups.

Usage: pnpm --filter @vueform/${adapter} test-smoke-types [--env <name>] [--build]

Envs (each is one consumer typecheck setup, run from packed tarballs):
${envRows}

Options:
  --env <name>, -E, -e      run only that env (default: all of them)
  --build, -B, -b           build @vueform/core and this adapter first
  --nopack                  reuse the previously packed tarballs
  --sequential              run the envs one after another (default: all in
                            parallel)
  --help                    this text

All child-process output is captured into .vueform/smoke-types/logs/; the run
ends with a link to the log file.
`
}

function parseArgs(argv: string[], adapter: string): ParsedArgs | null {
  let env: string | undefined
  let build = false
  let nopack = false
  let sequential = false

  const envIds = TYPE_ENVS.map((e) => e.id)
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

    if (arg === '--nopack') {
      nopack = true
      continue
    }

    if (arg === '--sequential') {
      sequential = true
      continue
    }

    throw new SmokeError(`Unknown argument: ${arg}\n\n${helpText(adapter)}`)
  }

  return { env, build, nopack, sequential }
}

const fmtDuration = (ms: number) => {
  const s = Math.round(ms / 1000)
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`
}

async function main(options: SmokeTypesCliOptions) {
  const adapterDir = path.resolve(options.adapterDir ?? process.cwd())
  const pkg = readJson(path.join(adapterDir, 'package.json'))
  const adapter = path.basename(adapterDir)
  const root = findRepoRoot(adapterDir)

  const parsed = parseArgs(process.argv.slice(2), adapter)
  if (!parsed) return

  const selected = parsed.env
    ? TYPE_ENVS.filter((env) => env.id === parsed.env)
    : TYPE_ENVS

  // Envs without a committed fixture: hard error when explicitly selected,
  // skip with a note on "run everything" invocations.
  const runnable: TypeEnvDef[] = []
  const results: TypesEnvResult[] = []

  for (const env of selected) {
    if (exists(fixtureDir(env))) {
      runnable.push(env)
    } else if (parsed.env) {
      throw new SmokeError(
        `Env "${env.id}" has no fixture shell at smoke-test/envs/${env.fixture} (in @vueform/utils).`
      )
    } else {
      results.push({ adapter, env, status: 'skip', detail: 'no fixture yet' })
    }
  }

  if (!runnable.length) {
    throw new SmokeError(
      `No fixture shells exist under smoke-test/envs/ (in @vueform/utils).`
    )
  }

  const stateDir = smokeTypesStateDir(root)
  const log = createSmokeLog(root, adapter, stateDir)
  // A flat row list, not the smoke matrix: two stages don't earn a grid, so
  // each env is one row whose running detail names the current stage.
  const display = createListDisplay({
    title: 'Smoke-types tests',
    tag: 'smoke-types',
    adapter: pkg.name ?? adapter,
    live: Boolean(process.stdout.isTTY),
    rows: selected.map((env) =>
      runnable.includes(env)
        ? { id: env.id }
        : { id: env.id, status: 'skip', detail: '— no fixture yet' }
    ),
  })

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

    display.phase(parsed.nopack ? 'checking tarballs…' : 'packing tarballs…')
    log.section('pack')
    const tarballs = await packWorkspace(root, tarballsDir(root), {
      skipPack: parsed.nopack,
      log: log.write,
      onStatus: display.phase,
    })
    display.phase(null)

    // Each env logs into its own buffer, flushed as one section on
    // completion — parallel envs would otherwise interleave the log file.
    const resultByEnv = new Map<string, TypesEnvResult>()
    const runOne = async (env: TypeEnvDef) => {
      const started = Date.now()
      let buffer = ''
      const bufLog = (text: string) => {
        buffer += text.endsWith('\n') ? text : text + '\n'
      }
      try {
        await runTypesEnv({
          root,
          adapter,
          adapterDir,
          env,
          tarballs,
          runsDir: path.join(stateDir, 'runs'),
          log: bufLog,
          report: (stage, status) => {
            if (status === 'active') display.row(env.id, 'active', `${stage}…`)
          },
        })
        resultByEnv.set(env.id, { adapter, env, status: 'pass' })
        display.row(env.id, 'pass', `(${fmtDuration(Date.now() - started)})`)
      } catch (error) {
        if (!(error instanceof SmokeError)) throw error
        bufLog(`FAILED: ${error.message}`)
        const stage = (
          error as SmokeError & { stage?: TypesEnvResult['stage'] }
        ).stage
        resultByEnv.set(env.id, {
          adapter,
          env,
          status: 'fail',
          detail: error.message,
          stage,
          logTail: error.logTail,
        })
        display.row(
          env.id,
          'fail',
          `— ${stage ?? 'failed'} (${fmtDuration(Date.now() - started)})`
        )
      }
      log.write(buffer)
    }

    if (parsed.sequential) {
      for (const env of runnable) await runOne(env)
    } else {
      await Promise.all(runnable.map(runOne))
    }

    // Summary rows in the fixed env order, not completion order.
    for (const env of runnable) results.push(resultByEnv.get(env.id)!)
  } finally {
    display.stop()
    log.close()
  }

  // No summary rows here — the display's row list already is the summary.
  const failures = results.filter((r) => r.status === 'fail')
  const ran = results.length - results.filter((r) => r.status === 'skip').length
  const status = failures.length
    ? red(`${failures.length} of ${ran} envs failed.`)
    : green('All envs passed.')
  console.log(`\n${status}`)

  if (failures.length) {
    // The failure details go to the errors sibling log, not the terminal.
    const sections = failures.map((f) => {
      const head = `––––– ${f.adapter}:${f.env.id}${f.stage ? ` — ${f.stage}` : ''} –––––`
      return [head, '', f.detail, ...(f.logTail ? ['', f.logTail] : [])].join(
        '\n'
      )
    })
    writeFileSync(log.errorsFile, sections.join('\n\n') + '\n')

    console.log(
      `\n${red(`${failures.length} envs failed - see full error log:`)}\n${termLink(log.errorsFile)}`
    )
  }
  console.log('')

  if (failures.length) process.exit(1)
}

export async function runSmokeTypesCli(
  options: SmokeTypesCliOptions = {}
): Promise<void> {
  try {
    await main(options)
  } catch (error) {
    if (error instanceof SmokeError) {
      console.error(`\n[smoke-types] ${error.message}`)
      process.exit(1)
    }
    throw error
  }
}
