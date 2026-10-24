/**
 * The shared root smoke-suite fan-out (used by `scripts/test-smoke.ts` and
 * `scripts/test-smoke-types.ts`): runs the given script of every adapter
 * that has it sequentially with inherited stdio, so each adapter's own live
 * env × stage matrix, logs and failure summary render exactly as in a direct
 * run (two live matrices cannot share a terminal, hence sequential).
 *
 * Tarballs come from the cached `vpr :pack` task (which also freshens the
 * builds via its `:build` dependency), and the adapters run with `--nopack`
 * — so nothing repacks unless a dist actually changed. Passing `--nopack`
 * yourself skips the vp step entirely and reuses the tarballs as they are
 * (this is how the `:test-smoke`/`:test-smoke-types` vp tasks invoke these
 * scripts, their own dependsOn having packed already).
 *
 * Flags: `--filter <pkg>` / `-F` / `-f` runs a single adapter (package
 * name, dir name, bare name or `vueform.alias`, e.g. `pv`); everything else
 * (`--env`/`-E`, `--sequential`, …) is forwarded to each adapter's CLI
 * untouched.
 */
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

export const repoRoot = path.resolve(
  fileURLToPath(new URL('.', import.meta.url)),
  '..'
)

const colors = Boolean(process.stdout.isTTY) && !('NO_COLOR' in process.env)
const paint = (code: string, text: string) =>
  colors ? `\x1b[${code}m${text}\x1b[0m` : text
export const green = (t: string) => paint('32', t)
export const red = (t: string) => paint('31', t)
export const bold = (t: string) => paint('1', t)

interface Pkg {
  dir: string
  name: string
  aliases: string[]
}

export interface SmokeRootOptions {
  /**
   * The per-adapter script to run (`test-smoke`, `test-smoke-types`).
   */
  script: string
  /**
   * The log prefix (`smoke`, `smoke-types`).
   */
  tag: string
  /**
   * Runs between the pack step and the adapter fan-out, against the freshly
   * ensured tarballs (the attw gate). Returning false fails the run, but the
   * adapters still execute so one invocation reports everything.
   */
  gate?: (repoRoot: string) => Promise<boolean>
}

/**
 * Runs `vpr :pack` with a live single-line status: vp's `$ <task> …` lines
 * (which carry the cache verdicts) and the pack script's `[pack] …` lines
 * are surfaced as they happen, so a cache miss (builds + repack after e.g. a
 * utils change) is visibly progressing instead of hanging silently. The full
 * output is kept and dumped only on failure.
 */
function packWithStatus(tag: string): Promise<boolean> {
  return new Promise((resolve) => {
    const live = Boolean(process.stdout.isTTY)
    const child = spawn('pnpm', ['exec', 'vpr', ':pack'], {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: process.platform !== 'win32',
    })
    // Ctrl-C during the pack step: kill the vp group (its builds included)
    // before exiting — detached children outlive the parent otherwise.
    const onSignal = () => {
      if (child.pid) {
        try {
          if (process.platform === 'win32') child.kill()
          else process.kill(-child.pid, 'SIGTERM')
        } catch {
          // Already gone.
        }
      }
      process.exit(130)
    }
    process.once('SIGINT', onSignal)
    process.once('SIGTERM', onSignal)

    let output = ''
    let statusShown = false
    const status = (text: string) => {
      const line = `[${tag}] ${text}`.slice(0, 100)
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
      process.removeListener('SIGINT', onSignal)
      process.removeListener('SIGTERM', onSignal)
      clearStatus()
      if (code !== 0) console.error(output)
      resolve(code === 0)
    })
  })
}

export async function runSmokeRoot(opts: SmokeRootOptions): Promise<void> {
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
      if (!pkg.scripts?.[opts.script]) return []
      const alias = pkg.vueform?.alias
      return [
        {
          dir,
          name: pkg.name as string,
          aliases: Array.isArray(alias) ? alias : alias ? [alias] : [],
        },
      ]
    })

  if (filter !== undefined) {
    const match = packages.find(
      ({ dir, name, aliases }) =>
        name === filter ||
        dir === filter ||
        name === `@vueform/${filter}` ||
        aliases.includes(filter)
    )
    if (!match) {
      console.error(
        `No package matching "${filter}" has a "${opts.script}" script ` +
          `(available: ${packages.map(({ dir }) => dir).join(', ')}).`
      )
      process.exit(1)
    }
    packages = [match]
  }

  // Pack through vp so the cache decides whether a repack is needed; the
  // adapter CLIs then always reuse. An explicit --nopack skips the vp step.
  if (!passthrough.includes('--nopack')) {
    if (!(await packWithStatus(opts.tag))) process.exit(1)
    passthrough.push('--nopack')
  }

  const gateOk = opts.gate ? await opts.gate(repoRoot) : true

  const failed: Pkg[] = []
  for (const pkg of packages) {
    const res = spawnSync(
      'pnpm',
      ['--filter', pkg.name, 'run', opts.script, ...passthrough],
      { cwd: repoRoot, stdio: 'inherit' }
    )
    if (res.status !== 0) failed.push(pkg)
  }

  if (packages.length > 1 || failed.length) {
    console.log(bold(`\n[${opts.tag}] Adapters:`))
    for (const pkg of packages) {
      const ok = !failed.includes(pkg)
      console.log(`  ${ok ? green('✓') : red('✗')} ${pkg.name}`)
    }
    console.log('')
  }

  if (failed.length || !gateOk) process.exit(1)
}
