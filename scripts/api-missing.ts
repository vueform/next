/**
 * Missing-descriptions report (`pnpm api:missing`): regenerates
 * `.vueform/api/missing.json` from the EXISTING assembled trees — no
 * extraction; run `pnpm api` first when the trees are stale or absent. Every
 * `loc` is listed once (first occurrence wins).
 *
 * Flags:
 *
 * - `--fullpath` write locs as clickable `file://…#L<line>` URLs instead of
 *   the repo-relative `path:line` default
 */
import * as fs from 'node:fs'
import * as path from 'node:path'

import { ensureUtilsDist } from './ensure-utils'

ensureUtilsDist()

const { collectMissingDescriptions, writeMissingReport } =
  await import('./api-extractor/lib/missing')
const { generatedDir } = await import('./api-extractor/lib/paths')
const { createPaint, resolveTerminalMode, termLink } =
  await import('./terminal')

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

const mode = resolveTerminalMode()
const { green, yellow, dim } = createPaint(mode.colors)

const report = collectMissingDescriptions({
  fullPath: args.includes('--fullpath'),
})
const file = writeMissingReport(report)
const total = Object.keys(report).length

if (total > 0) {
  console.log(
    `${yellow(
      `⚠ ${total} missing description${total > 1 ? 's' : ''}`
    )}${dim(' — ')}${termLink(file, mode)}`
  )
} else {
  console.log(`${green('No missing descriptions.')} ${dim(file)}`)
}
