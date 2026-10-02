/**
 * Root fan-out for the smoke suites (`pnpm test:smoke [flags...]`): runs each
 * adapter's own `smoke` script with the given flags, in sequence, and fails if
 * any adapter fails. Flags are the per-adapter smoke CLI's (see `pnpm --filter
 * @vueform/ui smoke --help`).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
)

const args = process.argv.slice(2)
const packagesDir = path.join(repoRoot, 'packages')
const failed: string[] = []

for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const pkgPath = path.join(packagesDir, entry.name, 'package.json')
  if (!fs.existsSync(pkgPath)) continue

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  const group = pkg.vueform?.group
  if ((group !== 'adapter' && group !== 'adapters') || !pkg.scripts?.smoke) {
    continue
  }

  console.log(`\n[smoke] ${pkg.name} ${args.join(' ')}\n`)
  const res = spawnSync(
    'pnpm',
    ['--filter', pkg.name, 'run', 'test:smoke', ...args],
    {
      cwd: repoRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    }
  )
  if (res.status !== 0) failed.push(pkg.name)
}

if (failed.length) {
  console.error(`\n[smoke] Failed: ${failed.join(', ')}`)
  process.exit(1)
}
