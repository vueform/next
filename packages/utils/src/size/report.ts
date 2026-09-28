import { readFileSync, writeFileSync } from 'node:fs'

import type { Results, ScenarioResult, Size } from './types'

type Metric = keyof Size

const METRICS: { metric: Metric; label: string; open: boolean }[] = [
  { metric: 'gzip', label: 'Gzip', open: true },
  { metric: 'brotli', label: 'Brotli', open: false },
  { metric: 'raw', label: 'Raw', open: false },
]

// &nbsp; keeps a value on a single line in rendered tables.
function kb(bytes: number): string {
  const value = (bytes / 1024).toFixed(2)
  return `${value === '-0.00' ? '0.00' : value}&nbsp;kB`
}

function subtract(a: Size, b: Size): Size {
  return {
    raw: a.raw - b.raw,
    gzip: a.gzip - b.gzip,
    brotli: a.brotli - b.brotli,
  }
}

// Order of the environment list: toolchain first, then core, then the
// package's own dependencies in their recorded order.
const PKG_ORDER = ['vue', 'vite', '@vueform/core']

function pkgRank(name: string): number {
  const index = PKG_ORDER.indexOf(name)
  return index === -1 ? PKG_ORDER.length : index
}

function table(headers: string[], rows: string[][]): string {
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n')
}

/**
 * One collapsible table per metric; gzip is expanded by default.
 */
function metricTables(
  headers: (metric: Metric) => string[],
  rows: (metric: Metric) => string[][]
): string[] {
  return METRICS.flatMap(({ metric, label, open }) => [
    open ? '<details open>' : '<details>',
    `<summary><h3>${label}</h3></summary>`,
    '',
    table(headers(metric), rows(metric)),
    '',
    '</details>',
    '',
  ])
}

/**
 * Renders the markdown report of a package's results — the section injected
 * into the package's README, so it carries no title of its own. `shared` is the
 * core package's results — adapter-independent per-module / per-rule /
 * per-locale costs embedded into every adapter report instead of having a
 * standalone report of their own.
 */
export function renderReport(results: Results, shared?: Results): string {
  const { scenarios } = results
  const isPlugin = results.type === 'plugin'
  const baseline = scenarios['baseline']

  // When PrimeVue-only reference scenarios exist, deltas are split into a
  // PrimeVue part (the raw primevue/* modules) and a Vueform part.
  const hasPv = Object.values(scenarios).some((result) => result.pv)

  /**
   * The PrimeVue-only counterpart of a scenario. The baseline has no PrimeVue
   * at all, so it is its own counterpart.
   */
  const pvOf = (result?: ScenarioResult): ScenarioResult | undefined =>
    result &&
    (result.pv
      ? scenarios[result.pv]
      : result === baseline
        ? baseline
        : undefined)

  /**
   * The effective size of a result: CSS assets count only in scenarios that
   * register the theme module (`result.themed`) — without it the CSS is not
   * functional. `css` can be overridden so both sides of a delta are counted
   * the same way (e.g. a scenario and its PrimeVue-only counterpart).
   */
  const pick = (
    result: ScenarioResult,
    metric: Metric,
    css: boolean = result.themed ?? false
  ): number => (css ? result.total : result.js)[metric]

  /**
   * The Vueform-only size of a scenario: its effective size minus its
   * PrimeVue-only counterpart's (counted the same way). For adapters without
   * counterparts, the effective size itself.
   */
  const vfSize = (result: ScenarioResult, metric: Metric): number => {
    const own = pick(result, metric)
    if (!hasPv) return own
    const pv = pvOf(result)
    return pv ? own - pick(pv, metric, result.themed ?? false) : own
  }

  const components = [
    ...new Set(
      Object.values(scenarios)
        .filter((result) => result.component)
        .map((result) => result.component!)
    ),
  ]

  // The base of the Total row — a full-featured setup with no components at
  // all. The per-component rows are measured against `full` itself.
  const componentsBase = scenarios['components-base']
  const full = scenarios['full']

  /**
   * `current − reference` on one asset part (JS, CSS or both), reduced to
   * Vueform-only code when PrimeVue-only counterparts exist (the delta of the
   * matched pv builds is subtracted). Each component drags along exactly the
   * theme chunks it needs (per-component CSS), so its CSS is part of its cost.
   */
  const componentDelta = (
    part: 'js' | 'css' | 'total',
    current?: ScenarioResult,
    reference?: ScenarioResult
  ): Size | undefined => {
    if (!current || !reference) return undefined
    const delta = subtract(current[part], reference[part])
    if (!hasPv) return delta
    const pvCurrent = pvOf(current)
    const pvReference = pvOf(reference)
    if (!pvCurrent || !pvReference) return undefined
    return subtract(delta, subtract(pvCurrent[part], pvReference[part]))
  }

  interface ComponentCost {
    component: string
    js?: Size
    css?: Size
  }

  const costs: ComponentCost[] = components.map((component) => ({
    component,
    js: componentDelta('js', full, scenarios[`all-minus-${component}`]),
    css: componentDelta('css', full, scenarios[`all-minus-${component}`]),
  }))

  costs.sort(
    (a, b) =>
      (b.js?.gzip ?? 0) +
      (b.css?.gzip ?? 0) -
      ((a.js?.gzip ?? 0) + (a.css?.gzip ?? 0))
  )

  const componentHeaders = () => ['Component', 'JS', 'CSS']

  const componentRows = (metric: Metric) => {
    const cell = (size?: Size) => (size ? kb(size[metric]) : '—')

    return [
      ...costs.map(({ component, js, css }) => [
        `\`${component}\``,
        cell(js),
        cell(css),
      ]),
      [
        '**Total**',
        cell(componentDelta('js', full, componentsBase)),
        cell(componentDelta('css', full, componentsBase)),
      ],
    ]
  }

  const env = results.environment

  // Plugin packages and their third-party deps show up versioned inside the
  // Plugins table instead of the intro list.
  const tabledPackages = new Set(
    Object.values(scenarios).flatMap((result) =>
      result.group === 'plugin'
        ? [result.plugin, result.dep].filter((name): name is string => !!name)
        : []
    )
  )

  const lines = [
    // Plugins ship no CSS of their own, so their report talks JS only.
    `Generated at ${results.generatedAt}. Sizes are the emitted ${isPlugin ? 'JS assets' : 'JS and CSS assets'} of a production Vite build with default settings (esbuild minification${isPlugin ? '' : ' for JS and CSS'}, no custom config), measured as deltas against a baseline${baseline ? ` (${baseline.description})` : ''}.`,
    '',
    // The pv mechanism is also used by the plugin suites for dep-only
    // references; the PrimeVue note only belongs to component adapters.
    ...(hasPv && costs.length
      ? [
          'All numbers show only what Vueform adds **on top of PrimeVue** — matched builds importing the same raw `primevue/*` modules without Vueform are subtracted.',
          '',
        ]
      : []),
    ...(env
      ? [
          'Measured with:',
          '',
          `- Node ${env.node}`,
          ...(env.packageManager ? [`- \`${env.packageManager}\``] : []),
          ...Object.entries(env.packages)
            .filter(([name]) => !tabledPackages.has(name))
            .sort((a, b) => pkgRank(a[0]) - pkgRank(b[0]))
            .map(([name, version]) => `- \`${name}@${version}\``),
          '',
        ]
      : []),
    ...(costs.length
      ? [
          '## How to interpret results',
          '',
          'In tables with a **Total** row, the individual rows show the size that removing that item saves from the bundle, while the **Total** row is measured with all items added — it also contains code shared between items, so it can exceed the sum of the individual rows.',
          '',
        ]
      : []),
  ]

  // Building blocks (modules, rules, locales) are adapter-independent and
  // measured once by the core package's suite; its results are embedded here.
  const blockScenarios = shared?.scenarios ?? {}
  const blockBase = blockScenarios['core']

  const blockSections = [
    {
      group: 'module',
      title: 'Modules',
      label: 'Module',
      total: 'modules-all',
    },
    {
      group: 'rule',
      title: 'Rules',
      label: 'Rule',
      total: 'rules-all',
    },
    {
      group: 'locale',
      title: 'Locales',
      label: 'Locale',
      total: undefined,
    },
  ].map((section) => ({
    ...section,
    names: Object.keys(blockScenarios).filter(
      (name) => blockScenarios[name].group === section.group
    ),
  }))

  const hasBlocks =
    !!blockBase && blockSections.some((section) => section.names.length)

  const coreResult = scenarios['core']

  if (coreResult && baseline) {
    lines.push(
      '## Core',
      '',
      'The size of the bare `createVueform` import — the smallest possible Vueform footprint. Modules, components, rules, locales and themes extend this size; for their numbers see the tables below.',
      '',
      table(
        ['', 'JS'],
        METRICS.map(({ metric, label }) => [
          label,
          kb(vfSize(coreResult, metric) - vfSize(baseline, metric)),
        ])
      ),
      ''
    )
  }

  const blockPick = (result: ScenarioResult, metric: Metric): number =>
    (result.themed ? result.total : result.js)[metric]

  /**
   * Lines of one building-block section (Per-module / Per-rule / Per-locale).
   */
  const blockSection = (group: string): string[] => {
    const section = blockSections.find((s) => s.group === group)
    if (!hasBlocks || !section?.names.length) return []

    const items = section.names
      .flatMap((name) => {
        const result = blockScenarios[name]
        // A scenario can name its own delta base (e.g. the model module is
        // measured against the `core` reference, since the model base
        // already contains model).
        const base = result.base ? blockScenarios[result.base] : blockBase
        if (!base) return []

        return [
          {
            item: result.item ?? name,
            delta: METRICS.reduce(
              (acc, { metric }) => ({
                ...acc,
                [metric]: blockPick(result, metric) - blockPick(base, metric),
              }),
              {} as Size
            ),
          },
        ]
      })
      .sort((a, b) => b.delta.gzip - a.delta.gzip)

    // The Total row is a directly measured all-included build (vs the same
    // base with none), not the sum of the rows — items share code that every
    // individual delta counts again, so the sum over-counts it.
    const totalResult = section.total
      ? blockScenarios[section.total]
      : undefined
    const totalBase = totalResult?.base
      ? blockScenarios[totalResult.base]
      : undefined
    const totalDelta =
      totalResult && totalBase
        ? METRICS.reduce(
            (acc, { metric }) => ({
              ...acc,
              [metric]:
                blockPick(totalResult, metric) - blockPick(totalBase, metric),
            }),
            {} as Size
          )
        : undefined

    return [
      `## ${section.title}`,
      '',
      `What each ${section.label.toLowerCase()} adds to the bundle when registered.`,
      '',
      ...metricTables(
        () => [section.label, 'JS'],
        (metric) => [
          ...items.map(({ item, delta }) => [`\`${item}\``, kb(delta[metric])]),
          ...(totalDelta ? [['**Total**', kb(totalDelta[metric])]] : []),
        ]
      ),
    ]
  }

  // Themes are adapter-specific (unlike modules/rules/locales) and measured
  // by the adapter's own suite: each theme build adds its token definitions
  // on top of the `themes-base` reference.
  const themeRows = Object.keys(scenarios)
    .filter((name) => scenarios[name].group === 'theme')
    .flatMap((name) => {
      const result = scenarios[name]
      const base = scenarios[result.base ?? 'themes-base']
      return base ? [{ item: result.item ?? name, result, base }] : []
    })

  const themeTokensSection = (): string[] =>
    themeRows.length
      ? [
          '## Themes',
          '',
          "What a theme's token definitions add to the bundle.",
          '',
          ...metricTables(
            () => ['Theme', 'JS'],
            (metric) =>
              themeRows.map(({ item, result, base }) => [
                themeRows.length === 1 ? 'Default theme' : `\`${item}\``,
                kb(result.js[metric] - base.js[metric]),
              ])
          ),
        ]
      : []

  lines.push(...blockSection('module'))

  if (costs.length) {
    lines.push(
      '## Components',
      '',
      'What each component adds to the bundle when registered, split into **JS** and **CSS** — a component imports exactly the theme chunks it needs, so its stylesheet cost is part of it.',
      '',
      'Values near zero — even slightly negative, within ±0.2 kB — are compression noise: removing the item can make the compression slightly more effective, and that improvement can exceed the few bytes the item itself adds.',
      '',
      ...metricTables(componentHeaders, componentRows)
    )
  }

  lines.push(
    ...blockSection('rule'),
    ...blockSection('locale'),
    ...themeTokensSection()
  )

  const pluginNames = Object.keys(scenarios).filter(
    (name) => scenarios[name].group === 'plugin'
  )

  if (pluginNames.length && baseline) {
    const pluginHeaders = () => [
      'Plugin',
      'Vueform',
      'Third-party',
      'Total',
      'Deps',
    ]

    const pluginRows = (metric: Metric) =>
      pluginNames.map((name) => {
        const result = scenarios[name]
        const dep = result.pv ? scenarios[result.pv] : undefined
        const total = result.total[metric] - baseline.total[metric]
        const third = dep
          ? dep.total[metric] - baseline.total[metric]
          : undefined

        const plugin = result.plugin ?? name
        // Versioned labels; these packages are left out of the intro list.
        const versioned = (pkg: string) =>
          `${pkg}${env?.packages[pkg] ? `@${env.packages[pkg]}` : ''}`

        return [
          `[\`${versioned(plugin)}\`](https://github.com/vueform/${plugin.replace('@vueform/', '')})`,
          third !== undefined ? kb(total - third) : '—',
          third !== undefined ? kb(third) : '—',
          kb(total),
          result.dep
            ? `[\`${versioned(result.dep)}\`](https://www.npmjs.com/package/${result.dep})`
            : '—',
        ]
      })

    lines.push(
      '## How to interpret results',
      '',
      "- **Vueform**: the plugin's own code. If your project already uses the third-party dependency listed under **Deps**, this is all the plugin adds.",
      '- **Third-party**: the dependency itself, built into the same app on its own, without the Vueform plugin.',
      '- **Total**: Vueform + Third-party — what the plugin adds if the dependency is not already in your project.',
      '',
      ...metricTables(pluginHeaders, pluginRows)
    )
  }

  return lines.join('\n').replace(/\n+$/, '') + '\n'
}

const START_MARKER = '<!--@size-start-->'
const END_MARKER = '<!--@size-end-->'

/**
 * Replaces the size section of a package's README — the content between
 * `<!--@size-start-->` and `<!--@size-end-->` — with the rendered report.
 */
export function injectReport(
  readmeFile: string,
  results: Results,
  shared?: Results
): void {
  const content = readFileSync(readmeFile, 'utf8')

  const start = content.indexOf(START_MARKER)
  const end = content.indexOf(END_MARKER)
  if (start === -1 || end === -1 || end < start) {
    throw new Error(
      `${readmeFile} is missing the ${START_MARKER} / ${END_MARKER} markers the size report is injected between.`
    )
  }

  writeFileSync(
    readmeFile,
    `${content.slice(0, start + START_MARKER.length)}\n\n${renderReport(
      results,
      shared
    )}\n${content.slice(end)}`
  )
}
