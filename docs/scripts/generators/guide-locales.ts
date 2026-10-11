import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = path.resolve(SCRIPT_DIR, '..', '..')
const ROOT = path.resolve(DOCS_ROOT, '..')
// Scraped by scripts/api-extractor — run `pnpm extract` at the monorepo root first
const LOCALES_JSON = path.join(ROOT, '.vueform/api/core/locales.json')
const TARGET_FILE = path.join(DOCS_ROOT, 'src/guide/locales.md')

const START_MARKER = '<!-- #region available-locales -->'
const END_MARKER = '<!-- #endregion available-locales -->'

interface LocaleEntry {
  key: string
  name?: string
  flag?: string
}

function discoverLocales(): LocaleEntry[] {
  if (!fs.existsSync(LOCALES_JSON)) {
    console.error(
      `[locales] ${path.relative(ROOT, LOCALES_JSON)} does not exist — run \`pnpm extract\` at the monorepo root first`
    )
    process.exit(1)
  }
  const locales: Record<string, LocaleEntry> = JSON.parse(
    fs.readFileSync(LOCALES_JSON, 'utf-8')
  )
  return Object.keys(locales)
    .sort()
    .map((code) => locales[code])
}

function renderTable(locales: LocaleEntry[]): string {
  const rows = locales.map((locale) => {
    const name = [locale.flag, locale.name ?? locale.key]
      .filter(Boolean)
      .join(' ')
    return `| \`${locale.key}\` | ${name} |`
  })

  return ['', '', `| Code | Name |`, '| --- | --- |', ...rows, '', ''].join(
    '\n'
  )
}

function main(): void {
  const codes = discoverLocales()

  if (codes.length === 0) {
    console.error('[locales] No locales found in', LOCALES_JSON)
    process.exit(1)
  }

  const md = fs.readFileSync(TARGET_FILE, 'utf-8')
  const startIdx = md.indexOf(START_MARKER)
  const endIdx = md.indexOf(END_MARKER)

  if (startIdx === -1 || endIdx === -1) {
    console.error(
      `[locales] Region markers not found in ${path.relative(ROOT, TARGET_FILE)}.\n` +
        `Expected:\n  ${START_MARKER}\n  ${END_MARKER}`
    )
    process.exit(1)
  }

  const table = renderTable(codes)
  const before = md.slice(0, startIdx + START_MARKER.length)
  const after = md.slice(endIdx)
  const result = before + table + after

  if (result !== md) {
    fs.writeFileSync(TARGET_FILE, result)
    console.log(
      `[locales] Wrote ${codes.length} locales to ${path.relative(ROOT, TARGET_FILE)}.`
    )
  } else {
    console.log(`[locales] No changes (${codes.length} locales).`)
  }
}

main()
