/**
 * Root smoke runner (`pnpm test-smoke`): runs every adapter's `test-smoke`
 * CLI sequentially with inherited stdio, so each adapter's own live
 * env × stage matrix, logs and failure summary render exactly as in a
 * direct run (two live matrices cannot share a terminal, hence sequential).
 *
 * Tarballs come from the cached `vpr :pack` task (which also freshens the
 * builds via its `:build` dependency), and the adapters run with `--nopack`
 * — so nothing repacks unless a dist actually changed. Passing `--nopack`
 * yourself skips the vp step entirely and reuses the tarballs as they are
 * (this is how the `:test-smoke` vp task invokes this script, its own
 * dependsOn having packed already).
 *
 * Flags: `--filter <pkg>` / `-F` / `-f` runs a single adapter (package
 * name, dir name, or bare name); everything else (`--env`/`-E`,
 * `--sequential`, …) is forwarded to each adapter's smoke CLI untouched.
 */
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(
  fileURLToPath(new URL('.', import.meta.url)),
  '..'
)

const colors = Boolean(process.stdout.isTTY) && !('NO_COLOR' in process.env)
const paint = (code: string, text: string) =>
  colors ? `\x1b[${code}m${text}\x1b[0m` : text
const green = (t: string) => paint('32', t)
const red = (t: string) => paint('31', t)
const bold = (t: string) => paint('1', t)

interface Pkg {
  dir: string
  name: string
}

let filter: string | undefined
const passthrough: string[] = []
const argv = process.argv.slice(2)
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i]
  if (arg === '--filter' || arg === '-F' || arg === '-f') {
    filter = argv[++i]
    continue
  }
  const match = arg.match(/^(?:--filter|-F|-f)=(.*)$/)
  if (match) {
    filter = match[1]
    continue
  }
  passthrough.push(arg)
}

let packages: Pkg[] = fs
  .readdirSync(path.join(repoRoot, 'packages'))
  .flatMap((dir) => {
    const manifest = path.join(repoRoot, 'packages', dir, 'package.json')
    if (!fs.existsSync(manifest)) return []
    const pkg = JSON.parse(fs.readFileSync(manifest, 'utf8'))
    return pkg.scripts?.['test-smoke']
      ? [{ dir, name: pkg.name as string }]
      : []
  })

if (filter !== undefined) {
  const match = packages.find(
    ({ dir, name }) =>
      name === filter || dir === filter || name === `@vueform/${filter}`
  )
  if (!match) {
    console.error(
      `No package matching "${filter}" has a "test-smoke" script ` +
        `(available: ${packages.map(({ dir }) => dir).join(', ')}).`
    )
    process.exit(1)
  }
  packages = [match]
}

/**
 * Runs `vpr :pack` with a live single-line status: vp's `$ <task> …` lines
 * (which carry the cache verdicts) and the pack script's `[pack] …` lines
 * are surfaced as they happen, so a cache miss (builds + repack after e.g. a
 * utils change) is visibly progressing instead of hanging silently. The full
 * output is kept and dumped only on failure.
 */
function packWithStatus(): Promise<boolean> {
  return new Promise((resolve) => {
    const live = Boolean(process.stdout.isTTY)
    const child = spawn('pnpm', ['exec', 'vpr', ':pack'], {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let output = ''
    let statusShown = false
    const status = (text: string) => {
      const line = `[smoke] ${text}`.slice(0, 100)
      if (live) {
        process.stdout.write(`\x1b[2K\r${line}`)
        statusShown = true
      } else {
        console.log(line)
      }
    }
    const clearStatus = () => {
      if (live && statusShown) process.stdout.write('\x1b[2K\r')
    }

    status('ensuring tarballs (vpr :pack, cached)…')

    const rl = readline.createInterface({ input: child.stdout })
    rl.on('line', (line) => {
      output += line + '\n'
      const task = line.match(/^\$ (.+)$/)
      if (task) status(task[1])
      const pack = line.match(/^\[pack\] (.+)$/)
      if (pack) status(pack[1])
    })
    child.stderr.on('data', (chunk: Buffer) => (output += chunk.toString()))

    child.on('close', (code) => {
      clearStatus()
      if (code !== 0) console.error(output)
      resolve(code === 0)
    })
  })
}

async function main() {
  // Pack through vp so the cache decides whether a repack is needed; the
  // adapter CLIs then always reuse. An explicit --nopack skips the vp step.
  if (!passthrough.includes('--nopack')) {
    if (!(await packWithStatus())) process.exit(1)
    passthrough.push('--nopack')
  }

  const failed: Pkg[] = []
  for (const pkg of packages) {
    const res = spawnSync(
      'pnpm',
      ['--filter', pkg.name, 'run', 'test-smoke', ...passthrough],
      { cwd: repoRoot, stdio: 'inherit' }
    )
    if (res.status !== 0) failed.push(pkg)
  }

  if (packages.length > 1 || failed.length) {
    console.log(bold('\n[smoke] Adapters:'))
    for (const pkg of packages) {
      const ok = !failed.includes(pkg)
      console.log(`  ${ok ? green('✓') : red('✗')} ${pkg.name}`)
    }
    console.log('')
  }

  if (failed.length) process.exit(1)
}

void main()
