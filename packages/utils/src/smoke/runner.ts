/**
 * Runs one env end to end: install (+ leak check), production build, then
 * the two Playwright specs — `boot.spec` (console/pageerror/warning policy,
 * per-element render assertions, SSR/hydration checks) and `interaction.spec`
 * (canonical interaction). Playwright starts the fixture's `serve` script
 * itself (webServer in the generated config) and always runs headless; each
 * spec is its own invocation so the display can report boot and interaction
 * separately.
 *
 * All child output goes to the invocation's log file (`input.log`); progress
 * is reported per stage through `input.report`.
 */
import { assembleRun, type AssembleInput, type SmokeRun } from './assemble'
import type { StageName, StageStatus } from './display'
import type { EnvDef, Pm } from './envs'
import { leakCheck } from './leak'
import { pickPort, run, SmokeError } from './lib'
import type { PackedTarballs } from './pack'
import { execArgs, installArgs, runScriptArgs, withInstallLock } from './pm'

export interface EnvRunInput {
  root: string
  adapter: string
  adapterDir: string
  env: EnvDef
  tarballs: PackedTarballs
  runsDir: string
  pm: Pm
  log: (text: string) => void
  report: (stage: StageName, status: StageStatus) => void
}

let browsersEnsured = false

export interface EnvResult {
  adapter: string
  env: EnvDef
  status: 'pass' | 'fail' | 'skip'
  detail?: string
  /**
   * The stage the failure happened in, when status is 'fail'.
   */
  stage?: StageName
  /**
   * Tail of the failing step's output (full output is in the log file).
   */
  logTail?: string
}

/**
 * Makes sure the Playwright chromium binary exists (a fast no-op when it is
 * already in the shared browser cache). Called by the CLI BEFORE the env
 * fan-out — parallel envs must not race the install.
 */
export async function ensureBrowsers(cwd: string, log: (text: string) => void) {
  if (browsersEnsured) return
  browsersEnsured = true

  // Repo-side tooling: the browser cache install always goes through pnpm,
  // whatever the fixtures install with.
  await run('pnpm', execArgs('pnpm', 'playwright', ['install', 'chromium']), {
    cwd,
    log,
    fail: '[smoke] Installing the Playwright chromium browser failed',
  })
}

export async function runEnv(input: EnvRunInput): Promise<void> {
  const { env, log, report, pm } = input
  const tag = `${input.adapter}:${env.id}`
  const port = await pickPort()

  const step = async (stage: StageName, fn: () => Promise<void>) => {
    report(stage, 'active')
    try {
      await fn()
    } catch (error) {
      report(stage, 'fail')
      if (error instanceof SmokeError) {
        throw Object.assign(error, { stage })
      }
      throw error
    }
    report(stage, 'pass')
  }

  log(`\n===== ${tag} (port: ${port}) =====`)
  const assembleInput: AssembleInput = { ...input, port }
  const smokeRun = await assembleRun(assembleInput)

  const scriptEnv = env.fixtureEnv
  const script = (name: string, fail: string) =>
    run(pm, runScriptArgs(pm, name), {
      cwd: smokeRun.dir,
      env: scriptEnv,
      log,
      fail: `[smoke:${tag}] ${fail}`,
    })

  await step('install', async () => {
    await withInstallLock(pm, () =>
      run(pm, installArgs(pm), {
        cwd: smokeRun.dir,
        log,
        fail: `[smoke:${tag}] Install failed`,
      })
    )
    leakCheck(smokeRun.dir, log)
  })

  await step('build', () => script('build', 'Build failed'))

  const playwright = (spec: string, fail: string) =>
    run(
      pm,
      execArgs(pm, 'playwright', ['test', '-c', 'playwright.config.mjs', spec]),
      {
        cwd: smokeRun.dir,
        log,
        fail: `[smoke:${tag}] ${fail}`,
      }
    )

  await step('boot', () => playwright('boot.spec.mjs', 'Boot spec failed'))

  await step('interaction', () =>
    playwright('interaction.spec.mjs', 'Interaction spec failed')
  )
}

export type { PackedTarballs, SmokeRun }
export { SmokeError }
