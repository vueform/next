export type ScenarioGroup =
  | 'fixed'
  /**
   * Reference build used only as the base of delta calculations (e.g. the
   * per-component reference setups), not shown in the report's intro table.
   */
  | 'ref'
  | 'component-remove'
  | 'theme'
  | 'module'
  | 'rule'
  | 'locale'
  | 'plugin'
  | 'pv'

export interface Scenario {
  name: string
  group: ScenarioGroup
  /**
   * Component the scenario measures (component-remove group).
   */
  component?: string
  /**
   * Building block the scenario measures (module / rule / locale groups).
   */
  item?: string
  /**
   * Name of the scenario this scenario's delta is measured against. Defaults to
   * `core` for building-block scenarios; the `model` module overrides it
   * because the core base already contains model.
   */
  base?: string
  /**
   * Plugin the scenario measures (plugin group).
   */
  plugin?: string
  /**
   * The plugin's heavy third-party dependency (plugin group), used in report
   * prose and headers.
   */
  dep?: string
  /**
   * Name of the matched reference scenario containing only third-party code
   * (raw primevue/* modules, a plugin's dependency), used to split a scenario's
   * delta into a third-party part and a Vueform part.
   */
  pv?: string
  /**
   * Human description used in reports.
   */
  description: string
  /**
   * Whether the scenario registers the theme module. Reported sizes count CSS
   * assets only when it does — without the theme module the CSS is not
   * functional, so it is not part of the scenario's meaningful cost.
   */
  themed?: boolean
  /**
   * Source code of the generated fixture src/main.ts.
   */
  entry: string
}

export interface Size {
  raw: number
  gzip: number
  brotli: number
}

export interface FileSize extends Size {
  file: string
  type: 'js' | 'css'
}

export interface ScenarioResult {
  group: ScenarioGroup
  component?: string
  item?: string
  base?: string
  plugin?: string
  dep?: string
  pv?: string
  description: string
  themed?: boolean
  files: FileSize[]
  js: Size
  css: Size
  total: Size
}

/**
 * The environment a suite was measured in: the versions of every package that
 * meaningfully participates in the builds, plus Node (its zlib does the
 * gzip/brotli compression). Machine details are irrelevant — sizes are not
 * performance numbers.
 */
export interface Environment {
  node: string
  /**
   * Package manager that installed the tree (e.g. "pnpm@10.0.0").
   */
  packageManager?: string
  packages: Record<string, string>
}

export interface Results {
  adapter: string
  generatedAt: string
  environment?: Environment
  scenarios: Record<string, ScenarioResult>
}
