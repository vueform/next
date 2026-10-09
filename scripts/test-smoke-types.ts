/**
 * Root smoke-types runner (`pnpm test-smoke-types`): the dist-types pipeline.
 * First the attw gate — `attw` (Are The Types Wrong) over every type-bearing
 * packed tarball, catching exports-map wiring bugs (types that resolve where
 * the JS doesn't, masquerading module kinds, untyped subpaths) in seconds,
 * with `--profile esm-only` since the packages ship no CJS on purpose. Then
 * every adapter's `test-smoke-types` CLI through the shared fan-out: real
 * consumer typechecks of the same tarballs (see
 * `@vueform/utils/smoke` typesEnvs.ts for the env matrix).
 *
 * attw checks that the shipped types RESOLVE; the consumer envs check that
 * their CONTENTS hold up. Both gates report before the run fails.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { bold, green, red, runSmokeRoot } from './smoke-root'

interface AttwTarget {
  name: string
  tarball: string
}

/**
 * Per-package attw exceptions. utils' type-test/visual-test exports point at
 * shipped .ts sources on purpose (in-repo test helpers, consumed through the
 * workspace, meaningless to npm consumers) — attw internal-errors on them.
 */
const EXCLUDED_ENTRYPOINTS: Record<string, string[]> = {
  '@vueform/utils': ['type-test', 'visual-test'],
}

/**
 * The packed tarballs worth pointing attw at: every packed package that
 * ships a `dist` (the type-bearing ones — config-only packages like
 * @vueform/tsconfig have no types to be wrong about).
 */
function attwTargets(repoRoot: string): AttwTarget[] {
  const tarballsDir = path.join(repoRoot, '.vueform', 'tarballs')
  const manifest: Record<string, string> = JSON.parse(
    fs.readFileSync(path.join(tarballsDir, 'manifest.json'), 'utf8')
  )

  const shipsDist = new Set(
    fs.readdirSync(path.join(repoRoot, 'packages')).flatMap((dir) => {
      const manifestPath = path.join(repoRoot, 'packages', dir, 'package.json')
      if (!fs.existsSync(manifestPath)) return []
      const pkg = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
      const files: string[] = pkg.files ?? []
      return files.includes('dist') ? [pkg.name as string] : []
    })
  )

  return Object.entries(manifest)
    .filter(([name]) => shipsDist.has(name))
    .map(([name, file]) => ({ name, tarball: path.join(tarballsDir, file) }))
}

function runAttw(
  repoRoot: string,
  target: AttwTarget
): Promise<{ target: AttwTarget; ok: boolean; output: string }> {
  return new Promise((resolve) => {
    const excluded = EXCLUDED_ENTRYPOINTS[target.name]
    const child = spawn(
      'pnpm',
      [
        'exec',
        'attw',
        target.tarball,
        '--profile',
        'esm-only',
        ...(excluded ? ['--exclude-entrypoints', ...excluded] : []),
      ],
      { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'] }
    )

    let output = ''
    child.stdout.on('data', (chunk: Buffer) => (output += chunk.toString()))
    child.stderr.on('data', (chunk: Buffer) => (output += chunk.toString()))
    child.on('close', (code) =>
      resolve({ target, ok: code === 0, output: output.trim() })
    )
  })
}

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

async function attwGate(repoRoot: string): Promise<boolean> {
  const targets = attwTargets(repoRoot)

  // A live progress line while the parallel attw runs finish — the rows
  // below are printed in fixed order once everything is in.
  const live = Boolean(process.stdout.isTTY)
  let finished = 0
  let tick = 0
  const progress = () =>
    `${SPINNER[tick % SPINNER.length]} [smoke-types] attw ${finished}/${targets.length} tarballs…`
  let timer: ReturnType<typeof setInterval> | undefined
  if (live) {
    timer = setInterval(() => {
      tick++
      process.stdout.write(`\x1b[2K\r${progress()}`)
    }, 100)
    process.stdout.write(`\x1b[2K\r${progress()}`)
  } else {
    console.log(`[smoke-types] attw (${targets.length} tarballs)…`)
  }

  const results = await Promise.all(
    targets.map(async (target) => {
      const result = await runAttw(repoRoot, target)
      finished++
      return result
    })
  )

  if (timer) clearInterval(timer)
  if (live) process.stdout.write('\x1b[2K\r')
  console.log(bold(`[smoke-types] attw (${targets.length} tarballs):`))

  for (const { target, ok } of results) {
    console.log(`  ${ok ? green('✓') : red('✗')} ${target.name}`)
  }

  const failures = results.filter((r) => !r.ok)
  for (const { target, output } of failures) {
    console.log(`\n${red(`––––– ${target.name} –––––`)}\n${output}`)
  }
  console.log('')

  return failures.length === 0
}

void runSmokeRoot({
  script: 'test-smoke-types',
  tag: 'smoke-types',
  gate: attwGate,
})
