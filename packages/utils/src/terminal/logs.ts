/**
 * Log capture for a runner invocation: a session log under the suite's
 * `.vueform/<scope>/logs` dir plus distilled `.errors.log`/`.warns.log`
 * siblings written only when there is something to look at. Writes are
 * synchronous (`fs.writeSync` on a fd) — several runners end in
 * `process.exit`, and a buffered stream would lose its tail.
 */
import fs from 'node:fs'
import path from 'node:path'

import { stripAnsi } from './paint'

export const KEPT_LOGS = 20

export interface LogSection {
  name: string
  body: string
}

export interface RunLog {
  stamp: string
  file: string
  errorsFile: string
  warnsFile: string
  write(text: string): void
  /**
   * A visual divider naming the step the following output belongs to.
   */
  section(title: string): void
  /**
   * Writes the distilled error sections (ANSI-stripped) and returns the file
   * path, or null when there is nothing to write.
   */
  writeErrors(sections: LogSection[]): string | null
  writeWarns(sections: LogSection[]): string | null
  close(): void
}

const formatSections = (sections: LogSection[]): string =>
  sections
    .map(
      ({ name, body }) => `––––– ${name} –––––\n\n${stripAnsi(body).trimEnd()}`
    )
    .join('\n\n') + '\n'

export function createRunLog(opts: {
  /**
   * The absolute logs directory (`<root>/.vueform/<scope>/logs`).
   */
  dir: string
  /**
   * Session-name prefix (`<prefix>-<stamp>`) for suites whose parallel
   * invocations share one directory (smoke adapters).
   */
  prefix?: string
  kept?: number
  /**
   * `false` skips the session log — only the distilled siblings are written
   * (suites whose full output is too large to keep).
   */
  mainLog?: boolean
}): RunLog {
  const { dir, prefix, kept = KEPT_LOGS, mainLog = true } = opts
  fs.mkdirSync(dir, { recursive: true })

  // Keep the directory from growing without bound — prune by session AGE
  // (newest file mtime per `<name>.`-prefixed session), never by name: names
  // sort adapter-first where sessions are prefixed, and a name-sorted prune
  // deleted one adapter's fresh logs while another adapter's run was still
  // printing links to them.
  const sessions = new Map<string, number>()
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.log')) continue
    try {
      const mtime = fs.statSync(path.join(dir, f)).mtimeMs
      const session = f.split('.')[0]
      sessions.set(session, Math.max(sessions.get(session) ?? 0, mtime))
    } catch {
      // Pruned by a parallel invocation.
    }
  }
  const byAge = [...sessions.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([session]) => session)
  for (const old of byAge.slice(0, -kept + 1)) {
    for (const f of fs.readdirSync(dir)) {
      if (f.startsWith(`${old}.`)) fs.rmSync(path.join(dir, f), { force: true })
    }
  }

  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\..+/, '')
    .replace('T', '-')
  const session = prefix ? `${prefix}-${stamp}` : stamp
  const file = path.join(dir, `${session}.log`)
  const errorsFile = path.join(dir, `${session}.errors.log`)
  const warnsFile = path.join(dir, `${session}.warns.log`)
  const fd = mainLog ? fs.openSync(file, 'w') : null

  return {
    stamp,
    file,
    errorsFile,
    warnsFile,
    write(text) {
      if (fd !== null && text) {
        fs.writeSync(fd, text.endsWith('\n') ? text : text + '\n')
      }
    },
    section(title) {
      if (fd !== null) fs.writeSync(fd, `\n––––– ${title} –––––\n`)
    },
    writeErrors(sections) {
      if (sections.length === 0) return null
      fs.writeFileSync(errorsFile, formatSections(sections))
      return errorsFile
    },
    writeWarns(sections) {
      if (sections.length === 0) return null
      fs.writeFileSync(warnsFile, formatSections(sections))
      return warnsFile
    },
    close() {
      if (fd !== null) fs.closeSync(fd)
    },
  }
}
