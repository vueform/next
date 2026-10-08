import { execFileSync } from 'node:child_process'
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
export const repoRoot = path.resolve(here, '../../..')
export const bin = path.resolve(here, '../bin/vueform.js')

export interface RunResult {
  stdout: string
  status: number
}

/**
 * Runs the built CLI in `cwd`, capturing output; never throws on exit 1.
 *
 * The VS Code markers are stripped from the child env: commands adapt to
 * running inside an editor terminal (`vueform view` opens files via `code`
 * instead of dumping them), and a test run must behave the same from any
 * terminal — not pop editor tabs for its temp projects.
 */
export function runCli(cwd: string, args: string[]): RunResult {
  const env = { ...process.env }
  delete env.TERM_PROGRAM
  delete env.VSCODE_GIT_IPC_HANDLE
  delete env.VSCODE_PID

  try {
    const stdout = execFileSync(process.execPath, [bin, ...args], {
      cwd,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
    })
    return { stdout, status: 0 }
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; status?: number }
    return {
      stdout: `${e.stdout ?? ''}${e.stderr ?? ''}`,
      status: e.status ?? 1,
    }
  }
}

/**
 * Scaffolds a throwaway project depending on @vueform/ui, with the workspace
 * package symlinked in (same pattern as smoke-e2e — no install involved).
 */
export function scaffoldProject({ typescript = true } = {}): string {
  const tmp = mkdtempSync(path.join(tmpdir(), 'vueform-cli-test-'))

  writeFileSync(
    path.join(tmp, 'package.json'),
    JSON.stringify(
      {
        name: 'vueform-cli-test',
        private: true,
        type: 'module',
        dependencies: { '@vueform/ui': '*' },
      },
      null,
      2
    )
  )
  // Presence of tsconfig.json switches the generated barrel to index.ts.
  if (typescript) writeFileSync(path.join(tmp, 'tsconfig.json'), '{}\n')

  const dest = path.join(tmp, 'node_modules', '@vueform', 'ui')
  mkdirSync(path.dirname(dest), { recursive: true })
  symlinkSync(path.join(repoRoot, 'packages', 'ui'), dest)

  return tmp
}

export function cleanup(tmp: string) {
  rmSync(tmp, { recursive: true, force: true })
}
