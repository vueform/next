/**
 * Runs one cell end to end. The tiers:
 *
 * - 0: install (+ leak check) and production build
 * - 1: boot — Playwright `boot.spec` (console/pageerror/warning policy,
 *   per-element render assertions, SSR/hydration checks)
 * - 2: canonical interaction — Playwright `interaction.spec`
 *
 * Install always runs (everything needs it); the build runs for tier 0 or
 * whenever Playwright tiers are selected. Playwright starts the fixture's
 * `serve` script itself (webServer in the generated config) and is always
 * headless unless --headed was explicitly given.
 */
import path from 'node:path'

import { assembleRun, type AssembleInput, type SmokeRun } from './assemble'
import type { CellDef, Pm } from './cells'
import { leakCheck } from './leak'
import { pickPort, run, SmokeError } from './lib'
import type { PackedTarballs } from './pack'
import { execArgs, installArgs, runScriptArgs } from './pm'

export interface CellRunInput {
  root: string
  adapter: string
  adapterDir: string
  cell: CellDef
  pm: Pm
  tarballs: PackedTarballs
  runsDir: string
  tiers: Set<number>
  headed: boolean
  viteMajor?: number
}

let browsersEnsured = false

export interface CellResult {
  adapter: string
  cell: CellDef
  status: 'pass' | 'fail' | 'skip'
  detail?: string
}

/**
 * Makes sure the Playwright chromium binary exists (a fast no-op when it is
 * already in the shared browser cache). Once per harness invocation.
 */
function ensureBrowsers(pm: Pm, smokeRun: SmokeRun) {
  if (browsersEnsured) return
  browsersEnsured = true

  run(pm, execArgs(pm, 'playwright', ['install', 'chromium']), {
    cwd: smokeRun.dir,
    fail: '[smoke] Installing the Playwright chromium browser failed',
  })
}

export async function runCell(input: CellRunInput): Promise<void> {
  const { cell, pm, tiers } = input
  const tag = `[smoke:${input.adapter}:${cell.id}]`
  const port = await pickPort()

  console.log(`${tag} Assembling run (pm: ${pm}, port: ${port})...`)
  const assembleInput: AssembleInput = { ...input, port }
  const smokeRun = assembleRun(assembleInput)

  const scriptEnv = cell.fixtureEnv
  const script = (name: string, fail: string) =>
    run(pm, runScriptArgs(pm, name), {
      cwd: smokeRun.dir,
      env: scriptEnv,
      fail: `${tag} ${fail}`,
    })

  console.log(`${tag} Installing (tier 0)...`)
  run(pm, installArgs(pm), {
    cwd: smokeRun.dir,
    fail: `${tag} Tier 0 (install) failed`,
  })
  leakCheck(smokeRun.dir)

  const wantsBrowser = tiers.has(1) || tiers.has(2)

  if (tiers.has(0) || wantsBrowser) {
    console.log(`${tag} Building (tier 0)...`)
    script('build', 'Tier 0 (build) failed')
  }

  if (!wantsBrowser) return

  ensureBrowsers(pm, smokeRun)

  const specs = [
    ...(tiers.has(1) ? ['boot.spec.mjs'] : []),
    ...(tiers.has(2) ? ['interaction.spec.mjs'] : []),
  ]

  console.log(`${tag} Running Playwright (${specs.join(', ')})...`)
  run(
    pm,
    execArgs(pm, 'playwright', [
      'test',
      '-c',
      'playwright.config.mjs',
      ...specs,
    ]),
    {
      cwd: smokeRun.dir,
      fail: `${tag} Tier ${tiers.has(1) ? '1/2' : '2'} (browser) failed`,
    }
  )
}

export function summarize(results: CellResult[]): boolean {
  console.log('\n[smoke] Summary:')
  for (const r of results) {
    const mark =
      r.status === 'pass' ? 'PASS' : r.status === 'fail' ? 'FAIL' : 'SKIP'
    console.log(
      `  ${mark}  ${r.adapter}:${r.cell.id}${r.detail ? ` — ${r.detail}` : ''}`
    )
  }

  return results.every((r) => r.status !== 'fail')
}

export function fixturePath(adapterDir: string, cell: CellDef) {
  return path.join(adapterDir, 'tests', 'smoke', cell.fixture)
}

export type { PackedTarballs, SmokeRun }
export { SmokeError }
