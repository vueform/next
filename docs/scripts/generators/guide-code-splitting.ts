import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import type {
  ScenarioResult,
  Size,
  SizeResults as Results,
} from '@vueform/utils'

/**
 * Fills the measured bundle sizes of each adapter's code-splitting guide from
 * the packages' size suite results (`pnpm size`, see utils' size runner).
 *
 * The page is authored by hand; this script only touches two kinds of marked
 * regions:
 *
 * - Inline values between `<!-- @size:<key> -->` and `<!-- /@size -->` are
 *   replaced with the named stat (see `collectStats` for the keys).
 * - Size cells of the tables between `<!-- @bundle-sizes:<kind> start -->` and
 *   `<!-- @bundle-sizes:<kind> end -->` markers are rewritten, matching rows by
 *   the backticked name in their first cell (`**Total**` rows get the directly
 *   measured all-included delta). A region may contain several tables; every
 *   other cell and the row order are left untouched.
 *
 * Sizes come from each measured package's own
 * `packages/<name>/node_modules/.vueform/size.json`, and — for the
 * adapter-independent building blocks (modules, rules, locales) — from the core
 * package's, the same way the suite's own report does. All values are gzipped
 * deltas.
 */

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = path.resolve(SCRIPT_DIR, '..', '..')
const ROOT = path.resolve(DOCS_ROOT, '..')
const DOCS_CONFIG_JSON = path.join(DOCS_ROOT, 'config.json')

const METRIC: keyof Size = 'gzip'

type Kind = 'modules' | 'components' | 'rules' | 'themes' | 'locales'

const KINDS: Kind[] = ['modules', 'components', 'rules', 'themes', 'locales']

/**
 * Per-row sizes of one table kind, keyed by the name in the row's first cell.
 */
interface KindSizes {
  /**
   * Column header → size in bytes, per item.
   */
  items: Map<string, Record<string, number>>
  /**
   * Column header → size in bytes for the `**Total**` row, if measured.
   */
  total?: Record<string, number>
}

// ---------------------------------------------------------------------------
// Sizes
// ---------------------------------------------------------------------------

function readResults(name: string): Results | undefined {
  const file = path.join(
    ROOT,
    'packages',
    name,
    'node_modules',
    '.vueform',
    'size.json'
  )
  return fs.existsSync(file)
    ? (JSON.parse(fs.readFileSync(file, 'utf-8')) as Results)
    : undefined
}

/**
 * The effective size of a scenario: CSS counts only when the scenario registers
 * the theme module — without it the CSS is not functional.
 */
function pick(result: ScenarioResult): number {
  return (result.themed ? result.total : result.js)[METRIC]
}

/**
 * Per-item cost of one building-block group (module / rule / locale) in bytes:
 * `size(base + X) − size(base)`, read from the suite that measured them
 * (`core.json`, or the adapter's own results when it has the group).
 */
function blockSizes(results: Results, group: string): Map<string, number> {
  const { scenarios } = results
  const sizes = new Map<string, number>()

  for (const [name, result] of Object.entries(scenarios)) {
    if (result.group !== group) continue
    const base = scenarios[result.base ?? 'core']
    if (!base) continue
    sizes.set(result.item ?? name, pick(result) - pick(base))
  }

  return sizes
}

/**
 * The directly measured Total of a building-block group — an all-included build
 * against the same base — or undefined when the suite has none.
 */
function blockTotal(results: Results, scenario: string): number | undefined {
  const result = results.scenarios[scenario]
  const base = result?.base ? results.scenarios[result.base] : undefined
  return result && base ? pick(result) - pick(base) : undefined
}

/**
 * `current − reference` on one asset part, reduced to Vueform-only code when
 * matched third-party reference scenarios exist (primevue) — mirrors the
 * suite's own report.
 */
function componentDelta(
  scenarios: Record<string, ScenarioResult>,
  part: 'js' | 'css',
  current?: ScenarioResult,
  reference?: ScenarioResult
): number | undefined {
  if (!current || !reference) return undefined
  const delta = current[part][METRIC] - reference[part][METRIC]

  const pvOf = (result: ScenarioResult) =>
    result.pv ? scenarios[result.pv] : undefined
  const pvCurrent = pvOf(current)
  const pvReference = pvOf(reference)

  if (!pvCurrent && !pvReference) return delta
  if (!pvCurrent || !pvReference) return undefined
  return delta - (pvCurrent[part][METRIC] - pvReference[part][METRIC])
}

/**
 * Sizes of every table kind for one adapter. Building blocks come from the
 * adapter's own results when it measures them, otherwise from `core.json`.
 */
function collectKinds(
  results: Results,
  shared?: Results
): Map<Kind, KindSizes> {
  const { scenarios } = results

  const blockSource = (group: string): Results => {
    const own = Object.values(scenarios).some((s) => s.group === group)
    if (own) return results
    if (!shared) {
      throw new Error(
        `No "${group}" scenarios for "${results.pkg}" and no core size.json — run \`pnpm size --core\` at the repo root first`
      )
    }
    return shared
  }

  const single = (sizes: Map<string, number>, total?: number): KindSizes => ({
    items: new Map([...sizes].map(([name, size]) => [name, { Size: size }])),
    total: total !== undefined ? { Size: total } : undefined,
  })

  const modulesSource = blockSource('module')
  const rulesSource = blockSource('rule')
  const localesSource = blockSource('locale')

  const full = scenarios['full']
  const components = new Map<string, Record<string, number>>()

  for (const result of Object.values(scenarios)) {
    if (!result.component) continue
    const js = componentDelta(scenarios, 'js', full, result)
    const css = componentDelta(scenarios, 'css', full, result)
    if (js === undefined || css === undefined) continue
    components.set(result.component, { JS: js, CSS: css })
  }

  const themes = new Map<string, number>()

  for (const [name, result] of Object.entries(scenarios)) {
    if (result.group !== 'theme') continue
    const base = scenarios[result.base ?? 'themes-base']
    if (!base) continue
    themes.set(result.item ?? name, result.js[METRIC] - base.js[METRIC])
  }

  return new Map<Kind, KindSizes>([
    [
      'modules',
      single(
        blockSizes(modulesSource, 'module'),
        blockTotal(modulesSource, 'modules-all')
      ),
    ],
    ['components', { items: components }],
    [
      'rules',
      single(
        blockSizes(rulesSource, 'rule'),
        blockTotal(rulesSource, 'rules-all')
      ),
    ],
    ['themes', single(themes)],
    ['locales', single(blockSizes(localesSource, 'locale'))],
  ])
}

/**
 * Named inline stats referenced by `<!-- @size:<key> -->` markers. All sizes
 * are formatted kB strings; `measured-with` is a package list.
 */
function collectStats(
  results: Results,
  kinds: Map<Kind, KindSizes>
): Map<string, string> {
  const { scenarios } = results
  const stats = new Map<string, string>()

  const baseline = scenarios['baseline']
  // Inline sizes render as code spans, where an `&nbsp;` entity would show
  // up literally — so unlike table cells, they use a plain space.
  const set = (key: string, bytes?: number) => {
    if (bytes !== undefined) {
      stats.set(key, `\`${(bytes / 1024).toFixed(2)} kB\``)
    }
  }

  if (baseline) {
    const against = (name: string) => {
      const result = scenarios[name]
      return result ? pick(result) - pick(baseline) : undefined
    }
    set('entry-core', against('core'))
    set('entry-model', against('model'))
    set('entry-full', against('full'))
    if (scenarios['full']) {
      set('entry-full-js', scenarios['full'].js[METRIC] - baseline.js[METRIC])
      set('entry-full-css', scenarios['full'].css[METRIC])
    }
  }

  const full = scenarios['full']
  const componentsBase = scenarios['components-base']
  set(
    'components-total-js',
    componentDelta(scenarios, 'js', full, componentsBase)
  )
  set(
    'components-total-css',
    componentDelta(scenarios, 'css', full, componentsBase)
  )

  const rules = kinds.get('rules')
  if (rules?.items.size) {
    const sizes = [...rules.items.values()].map((cols) => cols['Size'])
    set('rules-min', Math.min(...sizes))
    set('rules-max', Math.max(...sizes))
    set('rules-total', rules.total?.['Size'])
  }

  const moduleSize = (name: string) =>
    kinds.get('modules')?.items.get(name)?.['Size']
  set('module-locale', moduleSize('locale'))
  set('module-theme', moduleSize('theme'))

  const env = results.environment
  if (env?.packages[results.pkg]) {
    stats.set(
      'measured-with',
      `\`${results.pkg}@${env.packages[results.pkg]}\``
    )
  }

  return stats
}

function kb(bytes: number): string {
  // &nbsp; keeps the value on a single line in the rendered table.
  const value = (bytes / 1024).toFixed(2)
  return `${value === '-0.00' ? '0.00' : value}&nbsp;kB`
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function parseCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function renderCells(cells: string[]): string {
  return `| ${cells.join(' | ')} |`
}

function isSeparator(cells: string[]): boolean {
  return cells.every((cell) => /^:?-+:?$/.test(cell))
}

function nameOf(cell: string): string | undefined {
  return cell.match(/`([\w-]+)`/)?.[1]
}

interface RegionUpdate {
  content: string
  updated: string[]
  unknown: string[]
}

/**
 * Rewrites the size cells of every table between one kind's markers. Rows are
 * matched by the backticked name in their first cell; which columns are
 * rewritten comes from each table's own header. Everything else is left
 * untouched.
 */
function updateRegion(
  content: string,
  kind: Kind,
  sizes: KindSizes
): RegionUpdate {
  const startMarker = `<!-- @bundle-sizes:${kind} start -->`
  const endMarker = `<!-- @bundle-sizes:${kind} end -->`

  const startIdx = content.indexOf(startMarker)
  const endIdx = content.indexOf(endMarker)

  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(`Could not find markers: ${startMarker} / ${endMarker}`)
  }

  const regionStart = startIdx + startMarker.length
  const lines = content.slice(regionStart, endIdx).split('\n')

  const fillable = new Set(
    [...sizes.items.values(), sizes.total ?? {}].flatMap((cols) =>
      Object.keys(cols)
    )
  )

  const updated: string[] = []
  const unknown: string[] = []

  // Column header → index, for the table the current line belongs to.
  let columns: Map<string, number> = new Map()

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim().startsWith('|')) continue

    const cells = parseCells(lines[i])
    if (isSeparator(cells)) continue

    const next = lines[i + 1] ? parseCells(lines[i + 1]) : []
    if (next.length && isSeparator(next)) {
      // Header row: remember where this table keeps its size columns.
      columns = new Map(
        cells.flatMap((cell, index) =>
          fillable.has(cell) ? [[cell, index]] : []
        )
      )
      continue
    }

    const isTotal = cells[0] === '**Total**'
    const name = nameOf(cells[0])
    const row = isTotal ? sizes.total : name && sizes.items.get(name)

    if (!row) {
      unknown.push(isTotal ? '**Total**' : (name ?? cells[0]))
      continue
    }

    for (const [column, index] of columns) {
      if (row[column] === undefined) continue
      while (cells.length <= index) cells.push('')
      cells[index] = kb(row[column])
    }

    lines[i] = renderCells(cells)
    if (!isTotal) updated.push(name!)
  }

  return {
    content:
      content.slice(0, regionStart) + lines.join('\n') + content.slice(endIdx),
    updated,
    unknown,
  }
}

/**
 * Replaces the value between each `<!-- @size:<key> -->` / `<!-- /@size -->`
 * marker pair with the named stat.
 */
function updateInline(
  content: string,
  stats: Map<string, string>
): { content: string; unknown: string[] } {
  const unknown: string[] = []

  const next = content.replace(
    /(<!-- @size:([\w-]+) -->)[\s\S]*?(<!-- \/@size -->)/g,
    (match, open: string, key: string, close: string) => {
      const value = stats.get(key)
      if (value === undefined) {
        unknown.push(key)
        return match
      }
      return `${open}${value}${close}`
    }
  )

  return { content: next, unknown }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function pageFor(adapter: string): string {
  return adapter === 'ui'
    ? path.join(DOCS_ROOT, 'src', 'guide', 'code-splitting.md')
    : path.join(DOCS_ROOT, 'src', 'guide', `_${adapter}`, 'code-splitting.md')
}

function main(): void {
  const adapters = Object.keys(
    JSON.parse(fs.readFileSync(DOCS_CONFIG_JSON, 'utf-8')).adapters as Record<
      string,
      unknown
    >
  )
  const shared = readResults('core')

  for (const adapter of adapters) {
    const page = pageFor(adapter)

    if (!fs.existsSync(page)) {
      console.log(
        `[code-splitting] ${adapter}: no ${path.relative(ROOT, page)}, skipped`
      )
      continue
    }

    const results = readResults(adapter)
    if (!results) {
      throw new Error(
        `packages/${adapter} has no size.json — run \`pnpm size --${adapter}\` at the repo root first`
      )
    }

    const kinds = collectKinds(results, shared)
    const stats = collectStats(results, kinds)

    let content = fs.readFileSync(page, 'utf-8')

    const inline = updateInline(content, stats)
    content = inline.content

    for (const key of inline.unknown) {
      console.warn(`[code-splitting] ${adapter}: no stat for @size:${key}`)
    }

    let rows = 0

    for (const kind of KINDS) {
      const sizes = kinds.get(kind)!
      const update = updateRegion(content, kind, sizes)
      content = update.content
      rows += update.updated.length

      for (const name of update.unknown) {
        console.warn(
          `[code-splitting] ${adapter}: no measured size for ${kind} row "${name}", left as is`
        )
      }

      const missing = [...sizes.items.keys()].filter(
        (name) => !update.updated.includes(name)
      )
      if (missing.length) {
        console.warn(
          `[code-splitting] ${adapter}: measured but not in the ${kind} tables: ${missing.join(', ')}`
        )
      }
    }

    fs.writeFileSync(page, content)

    console.log(
      `[code-splitting] ${adapter}: ${rows} sizes from packages/${adapter}'s size.json → ${path.relative(ROOT, page)}`
    )
  }
}

main()
