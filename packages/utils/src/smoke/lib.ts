/**
 * Shared helpers for the smoke harness: repo/path discovery, process spawning
 * and small fs utilities. Everything ephemeral lives under
 * `.vueform/smoke` at the repo root (survives installs and `pnpm clean`).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'

export interface RunOptions {
  cwd: string
  env?: Record<string, string>
  /**
   * Failure message prefix; the command and exit code are appended.
   */
  fail: string
}

/**
 * A tier failure with a message already printed to the user.
 */
export class SmokeError extends Error {}

export function exists(p: string) {
  try {
    fs.accessSync(p)
    return true
  } catch {
    return false
  }
}

export function readJson(file: string) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

export function writeJson(file: string, value: unknown) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n')
}

/**
 * The workspace root, found by walking up to `pnpm-workspace.yaml`.
 */
export function findRepoRoot(from: string): string {
  let dir = path.resolve(from)
  for (;;) {
    if (exists(path.join(dir, 'pnpm-workspace.yaml'))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) {
      throw new SmokeError(
        `No pnpm-workspace.yaml found above ${from} — the smoke harness must run inside the monorepo.`
      )
    }
    dir = parent
  }
}

export function smokeStateDir(root: string) {
  return path.join(root, '.vueform', 'smoke')
}

/**
 * Runs a command with inherited stdio; throws SmokeError on non-zero exit.
 */
export function run(cmd: string, args: string[], opts: RunOptions) {
  const res = spawnSync(cmd, args, {
    cwd: opts.cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...opts.env },
  })

  if (res.status !== 0) {
    throw new SmokeError(
      `${opts.fail}: \`${cmd} ${args.join(' ')}\` exited with ${res.status ?? 'signal'}.`
    )
  }
}

/**
 * Runs a command capturing stdout (stderr inherits); throws on non-zero exit.
 */
export function runCapture(cmd: string, args: string[], opts: RunOptions) {
  const res = spawnSync(cmd, args, {
    cwd: opts.cwd,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    env: { ...process.env, ...opts.env },
    stdio: ['ignore', 'pipe', 'inherit'],
  })

  if (res.status !== 0) {
    throw new SmokeError(
      `${opts.fail}: \`${cmd} ${args.join(' ')}\` exited with ${res.status ?? 'signal'}.`
    )
  }

  return res.stdout
}

/**
 * An OS-assigned free port.
 */
export function pickPort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.unref()
    server.on('error', reject)
    server.listen(0, () => {
      const { port } = server.address() as net.AddressInfo
      server.close(() => resolve(port))
    })
  })
}

/**
 * Recursively copies `src` into `dest`, skipping node_modules and lockfiles
 * (fixture sources are committed clean, but be defensive about local runs).
 */
export function copyFixture(src: string, dest: string) {
  fs.cpSync(src, dest, {
    recursive: true,
    filter: (p) => {
      const base = path.basename(p)
      return (
        base !== 'node_modules' &&
        base !== 'dist' &&
        base !== '.nuxt' &&
        base !== '.output' &&
        !/^(pnpm-lock\.yaml|package-lock\.json|yarn\.lock|bun\.lockb?)$/.test(
          base
        )
      )
    },
  })
}
