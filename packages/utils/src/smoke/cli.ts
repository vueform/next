/**
 * The per-adapter smoke CLI (`pnpm --filter @vueform/<adapter> test:smoke
 * ...`). Dimension flags act as FILTERS over the fixed cell set — see
 * cells.ts.
 */
import path from 'node:path'

import { fixtureDir } from './assemble'
import {
  CELLS,
  filterCells,
  PMS,
  type CellDef,
  type CellFilters,
  type Pm,
} from './cells'
import {
  exists,
  findRepoRoot,
  readJson,
  smokeStateDir,
  SmokeError,
} from './lib'
import { packWorkspace } from './pack'
import { runCell, summarize, type CellResult } from './runner'

const ENV_FLAGS = { vite: 'envs', nuxt: 'envs' } as const
const RENDERING_FLAGS = { ssr: 'renderings', spa: 'renderings' } as const
const MODE_FLAGS = { vapor: 'modes', vdom: 'modes' } as const

interface ParsedArgs {
  filters: CellFilters
  filtered: boolean
  pm: Pm
  tiers: Set<number>
  skipPack: boolean
  packOnly: boolean
  headed: boolean
  viteMajor?: number
}

export interface SmokeCliOptions {
  /**
   * The adapter package dir. Defaults to cwd (`pnpm run` sets it).
   */
  adapterDir?: string
}

function helpText(adapter: string): string {
  const cellRows = CELLS.map(
    (c) =>
      `  ${c.id.padEnd(10)} env=${c.env.padEnd(5)} rendering=${c.rendering.padEnd(4)} mode=${c.mode.padEnd(6)} ${c.note}`
  ).join('\n')

  return `Smoke tests for @vueform/${adapter} — proves the packed tarballs work in real project setups.

Usage: pnpm --filter @vueform/${adapter} test:smoke [filters] [options]

Cells (each is one project setup, run from packed tarballs):
${cellRows}

Filters (each flag narrows one dimension; no flags = all cells; a combination
that matches no cell is unsupported and exits with an error):
  --vite | --nuxt      env
  --ssr  | --spa       rendering
  --vapor | --vdom     SFC mode

  Examples: --vite --ssr → vite-ssr | --nuxt --spa → nuxt-spa | --vapor → vapor
            --ssr → vite-ssr + nuxt | --nuxt --vapor → error (unsupported)

Package manager (installer for the fixture; not a filter):
  --pnpm (default) | --npm | --yarn | --bun

Options:
  --tiers=0,1,2        which tiers to run (default: all)
                       0 install+build, 1 boot, 2 interaction
  --skip-pack          reuse the previously packed tarballs
  --vite-major=<n>     pin the fixture's vite to that major (nightly lane;
                       vite-based cells only)
  --pack-only          build nothing, run nothing — just pack the tarballs
                       (CI's shared pack job)
  --headed             run the browser headed (manual debugging only;
                       everything is headless otherwise)
  --help               this text
`
}

function parseArgs(argv: string[], adapter: string): ParsedArgs | null {
  const filters: CellFilters = { envs: [], renderings: [], modes: [] }
  const pms: Pm[] = []
  let filtered = false
  let tiers = new Set([0, 1, 2])
  let skipPack = false
  let headed = false
  let packOnly = false
  let viteMajor: number | undefined

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      console.log(helpText(adapter))
      return null
    }

    if (!arg.startsWith('--')) {
      throw new SmokeError(
        `Unexpected argument: ${arg}\n\n${helpText(adapter)}`
      )
    }

    const [flag, value] = arg.slice(2).split('=', 2)

    if (flag in ENV_FLAGS) {
      filters.envs.push(flag as CellFilters['envs'][number])
      filtered = true
    } else if (flag in RENDERING_FLAGS) {
      filters.renderings.push(flag as CellFilters['renderings'][number])
      filtered = true
    } else if (flag in MODE_FLAGS) {
      filters.modes.push(flag as CellFilters['modes'][number])
      filtered = true
    } else if ((PMS as readonly string[]).includes(flag)) {
      pms.push(flag as Pm)
    } else if (flag === 'tiers') {
      const parsed = (value ?? '')
        .split(',')
        .filter(Boolean)
        .map((t) => Number(t))
      if (!parsed.length || parsed.some((t) => ![0, 1, 2].includes(t))) {
        throw new SmokeError(
          `Invalid --tiers value: ${value} (use e.g. --tiers=0,1)`
        )
      }
      tiers = new Set(parsed)
    } else if (flag === 'skip-pack') {
      skipPack = true
    } else if (flag === 'pack-only') {
      packOnly = true
    } else if (flag === 'headed') {
      headed = true
    } else if (flag === 'vite-major') {
      viteMajor = Number(value)
      if (!Number.isInteger(viteMajor) || viteMajor < 2) {
        throw new SmokeError(`Invalid --vite-major value: ${value}`)
      }
    } else {
      throw new SmokeError(`Unknown flag: ${arg}\n\n${helpText(adapter)}`)
    }
  }

  if (pms.length > 1) {
    throw new SmokeError(
      `At most one package manager flag may be given (got --${pms.join(' --')}).`
    )
  }

  return {
    filters,
    filtered,
    pm: pms[0] ?? 'pnpm',
    tiers,
    skipPack,
    packOnly,
    headed,
    viteMajor,
  }
}

async function main(options: SmokeCliOptions) {
  const adapterDir = path.resolve(options.adapterDir ?? process.cwd())
  const pkg = readJson(path.join(adapterDir, 'package.json'))
  const adapter = path.basename(adapterDir)
  const root = findRepoRoot(adapterDir)

  const parsed = parseArgs(process.argv.slice(2), adapter)
  if (!parsed) return

  if (parsed.packOnly) {
    packWorkspace(root, path.join(smokeStateDir(root), 'tarballs'), {
      skipPack: false,
    })
    return
  }

  const cells = filterCells(parsed.filters)
  if (!cells.length) {
    throw new SmokeError(
      `Unsupported combination — no cell matches the given filters.\n\n${helpText(adapter)}`
    )
  }

  // Cells without a committed fixture: hard error when explicitly selected,
  // skip with a note on unfiltered "run everything" invocations.
  const runnable: CellDef[] = []
  const results: CellResult[] = []

  for (const cell of cells) {
    if (exists(fixtureDir(adapterDir, cell))) {
      runnable.push(cell)
    } else if (parsed.filtered) {
      throw new SmokeError(
        `Cell "${cell.id}" has no fixture at packages/${adapter}/tests/smoke/${cell.fixture}.`
      )
    } else {
      results.push({ adapter, cell, status: 'skip', detail: 'no fixture yet' })
    }
  }

  if (!runnable.length) {
    throw new SmokeError(
      `No smoke fixtures exist yet under packages/${adapter}/tests/smoke/.`
    )
  }

  const stateDir = smokeStateDir(root)
  const tarballs = packWorkspace(root, path.join(stateDir, 'tarballs'), {
    skipPack: parsed.skipPack,
  })

  for (const cell of runnable) {
    try {
      await runCell({
        root,
        adapter,
        adapterDir,
        cell,
        pm: parsed.pm,
        tarballs,
        runsDir: path.join(stateDir, 'runs'),
        tiers: parsed.tiers,
        headed: parsed.headed,
        viteMajor: parsed.viteMajor,
      })
      results.push({ adapter, cell, status: 'pass' })
    } catch (error) {
      if (!(error instanceof SmokeError)) throw error
      console.error(`\n${error.message}\n`)
      results.push({ adapter, cell, status: 'fail', detail: error.message })
    }
  }

  if (!summarize(results)) process.exit(1)

  void pkg
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
