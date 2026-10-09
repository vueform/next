/**
 * Shared helpers for the smoke harness: repo/path discovery, process spawning
 * and small fs utilities. Everything ephemeral lives under `.vueform/` at the
 * repo root (survives installs and `pnpm clean`): the packed tarballs in
 * `.vueform/tarballs` (shared — smoke, smoke-types and the attw gate all
 * consume the same pack artifact), each suite's runs and logs in its own
 * state dir (`.vueform/smoke`, `.vueform/smoke-types`).
 */
import { spawn, type SpawnOptions } from 'node:child_process'
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
  /**
   * Sink for the child's captured stdout/stderr (the harness log file).
   */
  log?: (text: string) => void
}

/**
 * A tier failure. `logTail` carries the end of the failing step's output for
 * the error summary; the full output is in the log file.
 */
export class SmokeError extends Error {
  logTail?: string
}

const TAIL_LINES = 25

function tail(text: string): string {
  const lines = text.trimEnd().split('\n')
  return lines.slice(-TAIL_LINES).join('\n')
}

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

export function smokeTypesStateDir(root: string) {
  return path.join(root, '.vueform', 'smoke-types')
}

/**
 * Where `vpr :pack` puts the packed tarballs — outside both suites' state
 * dirs on purpose, because the tarballs are the shared input of everything
 * dist-side (smoke runs, smoke-types runs, the attw gate).
 */
export function tarballsDir(root: string) {
  return path.join(root, '.vueform', 'tarballs')
}

interface SpawnResult {
  status: number | null
  stdout: string
  stderr: string
}

/**
 * Async spawn with full stdout/stderr capture. Async on purpose: a
 * synchronous child blocks the event loop and freezes the display's spinner
 * for the whole step.
 */
function spawnCollect(
  cmd: string,
  args: string[],
  opts: RunOptions
): Promise<SpawnResult> {
  return new Promise((resolve, reject) => {
    const spawnOpts: SpawnOptions = {
      cwd: opts.cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
      env: { ...process.env, ...opts.env },
    }
    const child = spawn(cmd, args, spawnOpts)
    let stdout = ''
    let stderr = ''
    child.stdout!.on('data', (chunk: Buffer) => (stdout += chunk.toString()))
    child.stderr!.on('data', (chunk: Buffer) => (stderr += chunk.toString()))
    child.on('error', reject)
    child.on('close', (status) => resolve({ status, stdout, stderr }))
  })
}

/**
 * Runs a command with captured stdio (forwarded to `opts.log`); throws
 * SmokeError (carrying the output tail) on non-zero exit.
 */
export async function run(cmd: string, args: string[], opts: RunOptions) {
  const res = await spawnCollect(cmd, args, opts)

  // stdout and stderr arrive on separate pipes, so their interleaving is
  // lost; the log keeps them as two blocks per step.
  const output = res.stdout + (res.stderr ? `\n[stderr]\n${res.stderr}` : '')
  opts.log?.(output)

  if (res.status !== 0) {
    const error = new SmokeError(
      `${opts.fail}: \`${cmd} ${args.join(' ')}\` exited with ${res.status ?? 'signal'}.`
    )
    error.logTail = tail(output)
    throw error
  }
}

/**
 * Runs a command capturing stdout for the caller (stderr goes to the log);
 * throws on non-zero exit.
 */
export async function runCapture(
  cmd: string,
  args: string[],
  opts: RunOptions
) {
  const res = await spawnCollect(cmd, args, opts)

  if (res.stderr) opts.log?.(`[stderr]\n${res.stderr}`)

  if (res.status !== 0) {
    const error = new SmokeError(
      `${opts.fail}: \`${cmd} ${args.join(' ')}\` exited with ${res.status ?? 'signal'}.`
    )
    error.logTail = tail(res.stderr || res.stdout)
    throw error
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
