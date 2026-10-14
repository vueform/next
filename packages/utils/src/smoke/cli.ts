/**
 * The per-adapter smoke CLI (`pnpm --filter @vueform/<adapter> test-smoke
 * ...`). `--env <name>` / `-E <name>` selects a single env from the fixed
 * set (see envs.ts); without it every env runs. `--build` / `-B` builds
 * core and the current adapter first. Every run packs fresh tarballs and
 * runs all tiers headless with pnpm as the fixture installer.
 */
import { writeFileSync } from 'node:fs'
import path from 'node:path'

import { fixtureDir } from './assemble'
import { createDisplay, createSmokeLog, green, red, termLink } from './display'
import { ENVS, PMS, type EnvDef, type Pm } from './envs'
import {
  exists,
  findRepoRoot,
  readJson,
  run,
  smokeStateDir,
  SmokeError,
  tarballsDir,
} from './lib'
import { packWorkspace } from './pack'
import { ensureBrowsers, runEnv, type EnvResult } from './runner'

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
  /**
   * The package manager the fixtures install and run with (`--pm`).
   * pnpm is the default and what CI gates on; npm, yarn and bun are the
   * occasional cross-PM proof.
   */
  pm: Pm
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

Usage: pnpm --filter @vueform/${adapter} test-smoke [--env <name>] [--build]

Envs (each is one project setup, run from packed tarballs):
${envRows}

Options:
  --env <name>, -E, -e      run only that env (default: all of them)
  --build, -B, -b           build @vueform/core and this adapter first
  --nopack                  reuse the previously packed tarballs
  --sequential              run the envs one after another (default: all in
                            parallel)
  --pm <name>               install and run the fixtures with another package
                            manager (${PMS.join(', ')}; default: pnpm)
  --help                    this text

All child-process output is captured into .vueform/smoke/logs/; the run ends
with a link to the log file.
`
}

function parseArgs(argv: string[], adapter: string): ParsedArgs | null {
  let env: string | undefined
  let build = false
  let nopack = false
  let sequential = false
  let pm: Pm = 'pnpm'

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

    if (arg === '--nopack') {
      nopack = true
      continue
    }

    if (arg === '--sequential') {
      sequential = true
      continue
    }

    if (arg === '--pm' || arg.startsWith('--pm=')) {
      const value = arg === '--pm' ? argv[++i] : arg.split('=', 2)[1]
      if (!PMS.includes(value as Pm)) {
        throw new SmokeError(
          `--pm needs a package manager name (one of: ${PMS.join(', ')}).`
        )
      }
      pm = value as Pm
      continue
    }

    throw new SmokeError(`Unknown argument: ${arg}\n\n${helpText(adapter)}`)
  }

  return { env, build, nopack, sequential, pm }
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

  const runStarted = Date.now()

  const selected = parsed.env
    ? ENVS.filter((env) => env.id === parsed.env)
    : ENVS

  // Envs without a committed fixture: hard error when explicitly selected,
  // skip with a note on "run everything" invocations.
  const runnable: EnvDef[] = []
  const results: EnvResult[] = []

  for (const env of selected) {
    if (exists(fixtureDir(env))) {
      runnable.push(env)
    } else if (parsed.env) {
      throw new SmokeError(
        `Env "${env.id}" has no fixture shell at fixtures/smoke-test/envs/${env.fixture} (in @vueform/utils).`
      )
    } else {
      results.push({ adapter, env, status: 'skip', detail: 'no fixture yet' })
    }
  }

  if (!runnable.length) {
    throw new SmokeError(
      `No fixture shells exist under fixtures/smoke-test/envs/ (in @vueform/utils).`
    )
  }

  const stateDir = smokeStateDir(root)
  const log = createSmokeLog(root, adapter)
  const display = createDisplay({
    adapter: pkg.name ?? adapter,
    envIds: runnable.map((e) => e.id),
    live: Boolean(process.stdout.isTTY),
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

    // Before the fan-out: parallel envs must not race the browser install.
    display.phase('checking the Playwright browser…')
    await ensureBrowsers(adapterDir, log.write)
    display.phase(null)

    // Each env logs into its own buffer, flushed as one section on
    // completion — parallel envs would otherwise interleave the log file.
    const resultByEnv = new Map<string, EnvResult>()
    const runOne = async (env: EnvDef) => {
      let buffer = ''
      const bufLog = (text: string) => {
        buffer += text.endsWith('\n') ? text : text + '\n'
      }
      try {
        await runEnv({
          root,
          adapter,
          adapterDir,
          env,
          tarballs,
          pm: parsed.pm,
          runsDir: path.join(stateDir, 'runs'),
          log: bufLog,
          report: (stage, status) => display.stage(env.id, stage, status),
        })
        resultByEnv.set(env.id, { adapter, env, status: 'pass' })
      } catch (error) {
        if (!(error instanceof SmokeError)) throw error
        bufLog(`FAILED: ${error.message}`)
        resultByEnv.set(env.id, {
          adapter,
          env,
          status: 'fail',
          detail: error.message,
          stage: (error as SmokeError & { stage?: EnvResult['stage'] }).stage,
          logTail: error.logTail,
        })
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

  const failures = results.filter((r) => r.status === 'fail')

  const ran = results.length - results.filter((r) => r.status === 'skip').length
  const totalTime = fmtDuration(Date.now() - runStarted)
  const status = failures.length
    ? red(`${failures.length} of ${ran} envs failed in ${totalTime}.`)
    : green(`All envs passed in ${totalTime}.`)
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
