import type { BuiltInRules, UserConfig } from '@vueform/core'

// Name-only unions generated from each adapter's `src/components/*` —
// referencing the component barrels instead would load every component's
// d.ts and activate ALL type augmentations.
type UiComponentName = import('@vueform/ui/components/names').ComponentNames

type PrimeVueComponentName =
  import('@vueform/primevue/components/names').ComponentNames

export type VueformRuleName = BuiltInRules

export interface RuleFilter {
  include?: VueformRuleName[]
  exclude?: VueformRuleName[]
}

export type InstallAdapterMode = 'prompt' | 'auto' | 'never'
/**
 * Options shared by every adapter.
 */
export interface SharedModuleOptions<TComponentName extends string = string> {
  /**
   * Path of the user's Vueform config file relative to the project root,
   * without extension. Defaults to `./vueform.config` (`.ts` or `.js`).
   */
  configPath?: string
  /**
   * Whether the adapter's stylesheets are included. Defaults to `true`.
   */
  css?: boolean
  /**
   * Locales to register. The first one becomes the initial locale. Defaults to
   * `['en_US']`.
   */
  locales?: string[]
  /**
   * Components to register. Defaults to every component of the adapter.
   */
  include?: TComponentName[]
  /**
   * Components to leave out of the default set. Ignored when `include` is
   * given.
   */
  exclude?: TComponentName[]
  /**
   * Validation rules to register — a list, or include/exclude filters over the
   * adapter's full set. Defaults to every rule.
   */
  rules?: VueformRuleName[] | RuleFilter
  /**
   * Inline Vueform config, merged under the config file's values.
   */
  config?: UserConfig
  /**
   * What to do when the adapter package is not installed: ask before installing
   * it (`prompt`, the default), install it without asking (`auto`), or fail
   * with the install command (`never`). Prompting and auto-installing only
   * happen in an interactive dev session; otherwise the module fails with the
   * install command.
   */
  installAdapter?: InstallAdapterMode
}

export interface UiModuleOptions extends SharedModuleOptions<UiComponentName> {
  adapter: 'ui'
  /**
   * A built-in theme name (`primary`, `material`) — or a module specifier whose
   * default export is the token map (`~/themes/midnight`, a package name, or a
   * path relative to the project root).
   */
  theme?: 'primary' | 'material' | (string & {})
}

export interface PrimeVueModuleOptions extends SharedModuleOptions<PrimeVueComponentName> {
  adapter: 'primevue'
}

export type ModuleOptions = UiModuleOptions | PrimeVueModuleOptions

export type AdapterName = ModuleOptions['adapter']
