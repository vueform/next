/**
 * Missing-descriptions report (`pnpm api:missing`): regenerates
 * `.vueform/api/missing.json` from the EXISTING assembled trees — no
 * scraping; run `pnpm api` first when the trees are stale or absent.
 *
 * Flags (default: both kinds included):
 *
 * - `--flagged` only entries whose docblock carries `@write`
 * - `--unflagged` only entries without it
 * - `--unique` list each `loc` only once (first occurrence wins)
 */
import * as fs from 'node:fs'
import * as path from 'node:path'

import {
  collectMissingDescriptions,
  type MissingFilter,
  writeMissingReport,
} from './api-extractor/lib/missing'
import { generatedDir } from './api-extractor/lib/paths'

const args = process.argv.slice(2)
const KNOWN = ['--flagged', '--unflagged', '--unique']
const unknown = args.filter((a) => !KNOWN.includes(a))
if (unknown.length) {
  console.error(
    `Unknown flag(s): ${unknown.join(', ')} — available: ${KNOWN.join(', ')}`
  )
  process.exit(1)
}

const flagged = args.includes('--flagged')
const unflagged = args.includes('--unflagged')
const filter: MissingFilter | undefined =
  flagged === unflagged ? undefined : flagged ? 'flagged' : 'unflagged'

if (!fs.existsSync(path.join(generatedDir, 'core'))) {
  console.error('No assembled api trees found — run `pnpm api` first.')
  process.exit(1)
}

const live = Boolean(process.stdout.isTTY)
const colors = live && !('NO_COLOR' in process.env)
const paint = (code: string, text: string) =>
  colors ? `\x1b[${code}m${text}\x1b[0m` : text
const green = (t: string) => paint('32', t)
const yellow = (t: string) => paint('33', t)
const dim = (t: string) => paint('2', t)
const termLink = (file: string) =>
  live ? `\x1b]8;;file://${file}\x1b\\${file}\x1b]8;;\x1b\\` : file

const unique = args.includes('--unique')
const report = collectMissingDescriptions({ filter, unique })
const file = writeMissingReport(report)

const scope =
  (filter === 'flagged'
    ? ' (@write-flagged only)'
    : filter === 'unflagged'
      ? ' (unflagged only)'
      : '') + (unique ? ' (unique locs)' : '')

if (report.total > 0) {
  console.log(
    `${yellow(
      `⚠ ${report.total} missing description${report.total > 1 ? 's' : ''} (${report.locations} unique locations)${scope}`
    )}${dim(' — ')}${termLink(file)}`
  )
} else {
  console.log(`${green(`No missing descriptions${scope}.`)} ${dim(file)}`)
}
