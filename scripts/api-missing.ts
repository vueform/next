/**
 * Missing-descriptions report (`pnpm api:missing`): regenerates
 * `.vueform/api/missing.json` from the EXISTING assembled trees — no
 * scraping; run `pnpm api` first when the trees are stale or absent. Every
 * `loc` is listed once (first occurrence wins).
 *
 * Flags:
 *
 * - `--fullpath` write locs as clickable `file://…#L<line>` URLs instead of
 *   the repo-relative `path:line` default
 */
import * as fs from 'node:fs'
import * as path from 'node:path'

import {
  collectMissingDescriptions,
  writeMissingReport,
} from './api-extractor/lib/missing'
import { generatedDir } from './api-extractor/lib/paths'

const args = process.argv.slice(2)
const KNOWN = ['--fullpath']
const unknown = args.filter((a) => !KNOWN.includes(a))
if (unknown.length) {
  console.error(
    `Unknown flag(s): ${unknown.join(', ')} — available: ${KNOWN.join(', ')}`
  )
  process.exit(1)
}

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

const report = collectMissingDescriptions({
  fullPath: args.includes('--fullpath'),
})
const file = writeMissingReport(report)
const total = Object.keys(report).length

if (total > 0) {
  console.log(
    `${yellow(
      `⚠ ${total} missing description${total > 1 ? 's' : ''}`
    )}${dim(' — ')}${termLink(file)}`
  )
} else {
  console.log(`${green('No missing descriptions.')} ${dim(file)}`)
}
