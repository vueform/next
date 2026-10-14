/**
 * Shared SIGINT/SIGTERM teardown: kills every tracked child's process group,
 * runs the registered cleanups (cursor restore), and exits with the
 * conventional code. Handlers install lazily on first use — importing this
 * module never mutates process state.
 */
import type { ChildProcess } from 'node:child_process'

const children = new Set<ChildProcess>()
const cleanups = new Set<() => void>()
let installed = false

const install = () => {
  if (installed) return
  installed = true
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, () => {
      for (const child of children) {
        if (!child.pid) continue
        try {
          if (process.platform === 'win32') child.kill()
          else process.kill(-child.pid, 'SIGTERM')
        } catch {
          // Already gone.
        }
      }
      for (const fn of cleanups) fn()
      process.exit(signal === 'SIGINT' ? 130 : 143)
    })
  }
}

/**
 * Registers a child whose process group dies with this run. Spawn it with
 * `detached: true` on POSIX or the group kill cannot reach its workers.
 */
export function trackChild(child: ChildProcess): void {
  install()
  children.add(child)
}

export function untrackChild(child: ChildProcess): void {
  children.delete(child)
}

/**
 * Registers a teardown (cursor restore) to run on SIGINT/SIGTERM. Returns the
 * unsubscribe.
 */
export function onCleanup(fn: () => void): () => void {
  install()
  cleanups.add(fn)
  return () => cleanups.delete(fn)
}
