import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { ScenarioResult, SizeResults as Results } from '@vueform/utils'

/**
 * Fills the generated parts of each plugin reference page
 * (`src/plugins/<plugin>.md`) from the plugin's package, matching pages to
 * packages by filename (`src/plugins/expr-eval.md` → `packages/expr-eval`):
 *
 * - **Dependencies** come from the package.json's `dependencies`, written as
 *   npm links into the meta table's `<!-- @plugin:deps -->` inline marker.
 * - **Bundle size** comes from the plugin package's size suite results
 *   (`packages/<plugin>/size.json`, see `pnpm size --<plugin>`): the gzipped
 *   delta of the plugin scenario against the baseline — split into the
 *   plugin's own code (measured against the `pv` dep-only scenario, when the
 *   suite has one) and the full cost with its third-party deps. The value is
 *   written between the page's `<!-- @size:plugin -->` / `<!-- /@size -->`
 *   markers.
 *
 * A page without a matching package is a placeholder for a planned plugin and
 * is skipped, keeping whatever its markers hold; a marked page whose package
 * exists but misses its size.json or one of the two markers fails the run.
 * Plugin packages (`vueform.group: "plugins"`) without a page are warned
 * about.
 */

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = path.resolve(SCRIPT_DIR, '..', '..')
const ROOT = path.resolve(DOCS_ROOT, '..')
const PAGES_DIR = path.join(DOCS_ROOT, 'src', 'plugins')
const PACKAGES_DIR = path.join(ROOT, 'packages')

// ---------------------------------------------------------------------------
// Package data
// ---------------------------------------------------------------------------

/**
 * The runtime dependency names from the plugin's package.json.
 */
function dependencies(name: string): string[] {
  const file = path.join(PACKAGES_DIR, name, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(file, 'utf-8'))

  return Object.keys(pkg.dependencies ?? {})
}

/**
 * The effective size of a scenario: CSS counts only when the scenario
 * registers the theme module — without it the CSS is not functional.
 */
function pick(result: ScenarioResult): number {
  return (result.themed ? result.total : result.js).gzip
}

/**
 * The plugin's gzipped bundle cost from its size suite results: its own code
 * (`own`, the plugin scenario against the dep-only `pv` scenario) and the
 * full delta against the baseline (`withDeps`). Without a `pv` scenario the
 * plugin has no third-party runtime and the two are the same.
 */
function pluginSize(
  name: string,
  page: string
): { own: number; withDeps?: number } {
  const file = path.join(PACKAGES_DIR, name, 'size.json')

  if (!fs.existsSync(file)) {
    throw new Error(
      `${page} has no packages/${name}/size.json — run \`pnpm size --${name}\` at the repo root first`
    )
  }

  const { scenarios } = JSON.parse(fs.readFileSync(file, 'utf-8')) as Results
  const scenario = Object.values(scenarios).find(
    (result) => result.group === 'plugin'
  )
  const baseline = scenarios['baseline']

  if (!scenario || !baseline) {
    throw new Error(
      `packages/${name}/size.json has no plugin + baseline scenarios for ${page}`
    )
  }

  const withDeps = pick(scenario) - pick(baseline)
  const pv = scenario.pv ? scenarios[scenario.pv] : undefined
  const own = pv ? pick(scenario) - pick(pv) : withDeps

  // A development-only plugin (devtools) measures smaller than its dep-only
  // scenario — the production build drops the plugin, dep included, so the
  // whole delta against the baseline is the honest number and the dep split
  // is meaningless.
  return pv && own >= 0 ? { own, withDeps } : { own: withDeps }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/**
 * Replaces the value between an inline `<!-- @<key> -->` / `<!-- /@<close> -->`
 * marker pair.
 */
function updateInline(
  content: string,
  key: string,
  closeKey: string,
  value: string,
  page: string
): string {
  const open = `<!-- @${key} -->`
  const close = `<!-- /@${closeKey} -->`
  const pattern = new RegExp(
    `(${escapeRegExp(open)})[\\s\\S]*?(${escapeRegExp(close)})`
  )

  if (!pattern.test(content)) {
    throw new Error(`${page} has no ${open} marker`)
  }

  return content.replace(pattern, `$1${value}$2`)
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function depLinks(deps: string[]): string {
  if (!deps.length) return '—'
  return deps
    .map((dep) => `[\`${dep}\`](https://www.npmjs.com/package/${dep})`)
    .join(' · ')
}

function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(2)} kB`
}

function sizeValue({ own, withDeps }: ReturnType<typeof pluginSize>): string {
  return withDeps === undefined
    ? kb(own)
    : `${kb(own)} *(${kb(withDeps)} with 3rd party deps)*`
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const pages = fs
    .readdirSync(PAGES_DIR)
    .filter((entry) => entry.endsWith('.md') && entry !== 'index.md')
    .sort()

  const documented = new Set(pages.map((page) => page.slice(0, -'.md'.length)))

  for (const entry of fs.readdirSync(PACKAGES_DIR)) {
    const file = path.join(PACKAGES_DIR, entry, 'package.json')
    if (!fs.existsSync(file) || documented.has(entry)) continue
    const pkg = JSON.parse(fs.readFileSync(file, 'utf-8'))
    if (pkg.vueform?.group === 'plugins') {
      console.warn(
        `[plugins] no src/plugins/${entry}.md page for the ${pkg.name} plugin`
      )
    }
  }

  let updated = 0
  let planned = 0

  for (const entry of pages) {
    const name = entry.slice(0, -'.md'.length)
    const page = `src/plugins/${entry}`
    const file = path.join(PAGES_DIR, entry)
    const content = fs.readFileSync(file, 'utf-8')

    if (!fs.existsSync(path.join(PACKAGES_DIR, name, 'package.json'))) {
      planned++
      continue
    }

    let next = updateInline(
      content,
      'plugin:deps',
      'plugin:deps',
      depLinks(dependencies(name)),
      page
    )
    next = updateInline(
      next,
      'size:plugin',
      'size',
      sizeValue(pluginSize(name, page)),
      page
    )

    if (next !== content) {
      fs.writeFileSync(file, next)
      updated++
    }
  }

  console.log(
    `[plugins] ${updated} of ${pages.length} plugin pages updated from package.json and size.json (${planned} planned-plugin placeholders skipped)`
  )
}

main()
