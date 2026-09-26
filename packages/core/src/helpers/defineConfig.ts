import type {
  AutosaveModule,
  AutosaveModuleOptions,
} from '#core/modules/autosave'
import type {
  ConditionsModule,
  ConditionsModuleOptions,
} from '#core/modules/conditions'
import type { DateModule, DateModuleOptions } from '#core/modules/date'
import type {
  DevtoolsModule,
  DevtoolsModuleOptions,
} from '#core/modules/devtools'
import type {
  ExpressionModule,
  ExpressionModuleOptions,
} from '#core/modules/expression'
import type { HttpModule, HttpModuleOptions } from '#core/modules/http'
import type { LocaleModule, LocaleModuleOptions } from '#core/modules/locale'
import type { ModelModule, ModelModuleOptions } from '#core/modules/model'
import type {
  RouterModule,
  RouterModuleOptions,
  VueformRouter,
} from '#core/modules/router'
import type {
  SecurityModule,
  SecurityModuleOptions,
} from '#core/modules/security'
import type {
  DarkModeConfig,
  ThemeModule,
  ThemeModuleOptions,
} from '#core/modules/theme'
import type {
  SizeTypes,
  RuleDefinition,
  ValidationModule,
  ValidationModuleOptions,
} from '#core/modules/validation'
import type { VueformModule } from './defineModule'
import type { VueformPlugin } from './definePlugin'
import type { ComputedRef, MaybeRef } from 'vue'
import {
  type ComponentRegistry,
  type ComponentNames,
  type ElementRegistry,
  type ElementNames,
  type LanguagesProp,
  type LocalesProp,
  type LooseClasses,
  type PartialDeepKeys,
  type PresetDefinition,
  type UID,
  type VueformComponent,
  type ThemeTokens,
} from '#core/types'

/**
 * The registered Vueform module implementations.
 */
export interface VueformModules {
  /**
   * The autosave module for interval, event, and local-draft form saving.
   */
  autosave?: VueformModule<AutosaveModule>

  /**
   * The HTTP module for network requests.
   */
  http?: VueformModule<HttpModule>

  /**
   * The date module for date manipulation and comparison.
   */
  date?: VueformModule<DateModule>

  /**
   * The devtools module for Vue DevTools form inspection (development-only).
   */
  devtools?: VueformModule<DevtoolsModule>

  /**
   * The locale module for translation and localization.
   */
  locale?: VueformModule<LocaleModule>

  /**
   * The security module for HTML sanitization.
   */
  security?: VueformModule<SecurityModule>

  /**
   * The theme module for CSS variable generation, dark-mode detection, and
   * style injection.
   */
  theme?: VueformModule<ThemeModule>

  /**
   * The router module for browser history integration in multi-step forms.
   */
  router?: VueformModule<RouterModule>

  /**
   * The expression module for resolving dynamic string expressions.
   */
  expression?: VueformModule<ExpressionModule>

  /**
   * The conditions module for evaluating element visibility.
   */
  conditions?: VueformModule<ConditionsModule>

  /**
   * The validation module for creating and running element validators.
   */
  validation?: VueformModule<ValidationModule>

  /**
   * The model module for form data store integration.
   */
  model?: VueformModule<ModelModule>
}

/**
 * The modules of a Vueform instance (`vueform.modules`): created by
 * `createVueform()` from the definitions registered in `config.modules`. This
 * is what composables and doorways read (`vueform.modules.locale`); absent
 * modules are simply missing and consumers fall back to their inert noop
 * surfaces.
 */
export interface VueformInstanceModules {
  autosave?: AutosaveModule
  http?: HttpModule
  date?: DateModule
  devtools?: DevtoolsModule
  locale?: LocaleModule
  security?: SecurityModule
  theme?: ThemeModule
  router?: RouterModule
  expression?: ExpressionModule
  conditions?: ConditionsModule
  validation?: ValidationModule

  /**
   * The model module is required — `createVueform()` throws without it, so the
   * instance always carries it.
   */
  model: ModelModule
}

/**
 * Global layout values derived from the Vueform configuration, held on the
 * instance (`vueform.globals`). The base values come from the default config's
 * `globals` hook; user configs and plugins extend them through theirs.
 */
export interface VueformGlobals {
  /**
   * The default responsive breakpoint used for layout calculations.
   */
  defaultBreakpoint: ComputedRef<string>
}

/**
 * The argument of a `globals` hook — the config-level one and plugins' alike.
 */
export interface GlobalsHookContext {
  /**
   * The resolved Vueform configuration.
   */
  config: VueformConfig

  /**
   * The globals accumulated so far (the entry's built-ins, earlier hooks').
   * Read-only — return members to add or override.
   */
  globals: Readonly<Partial<VueformGlobals>>
}

/**
 * The resolved Vueform configuration object used internally after merging user
 * config with defaults.
 */
/**
 * Class overrides keyed by component name, with `*` for all components and
 * `*element` for all elements. Functional class keys also accept a plain
 * `ClassValue`.
 */
export type ComponentClassesMap = {
  [K in ComponentNames]?: LooseClasses<ComponentRegistry[K]['classes']>
} & {
  '*'?: LooseClasses<ComponentRegistry[ComponentNames]['classes']> &
    Record<string, any>
} & {
  '*element'?: LooseClasses<ElementRegistry[ElementNames]['classes']> &
    Record<string, any>
}

/**
 * The shared element class map the element layout installs (`root`, `label`,
 * `errors`, …). Functional class keys also accept a plain `ClassValue`.
 */
export type LayoutClassesMap = LooseClasses<
  ElementRegistry[ElementNames]['classes']
> &
  Record<string, any>

/**
 * Default prop values keyed by component name, with `*` for all components and
 * `*element` for all elements.
 */
export type ComponentDefaultsMap = {
  [K in ComponentNames]?: Partial<ComponentRegistry[K]['props']>
} & {
  '*'?: Partial<ComponentRegistry[ComponentNames]['props']> &
    Record<string, any>
} & {
  '*element'?: Partial<ElementRegistry[ElementNames]['props']> &
    Record<string, any>
}

export interface VueformConfig {
  /**
   * The registered module definitions keyed by module name — the same shape the
   * user passes. `createVueform()` creates the modules from them onto
   * `vueform.modules`.
   */
  modules: VueformModules

  /**
   * Global autosave module options (reserved).
   */
  $autosave: AutosaveModuleOptions

  /**
   * Global conditions options controlling structured condition strictness and
   * async condition re-evaluation (e.g. the debounce delay applied before
   * re-running async conditional props when their trigger source changes).
   */
  $conditions: ConditionsModuleOptions

  /**
   * Global date module options (e.g. a custom date adapter).
   */
  $date: DateModuleOptions

  /**
   * Global devtools module options (reserved).
   */
  $devtools: DevtoolsModuleOptions

  /**
   * Global expression module options (e.g. a custom expression provider).
   */
  $expression: ExpressionModuleOptions

  /**
   * Global HTTP module options (base URL, timeout, headers, etc.).
   */
  $http: HttpModuleOptions

  /**
   * Global locale module options (e.g. a custom locale provider).
   */
  $locale: LocaleModuleOptions

  /**
   * Global model module options.
   */
  $model: ModelModuleOptions

  /**
   * Global router module options (e.g. a custom router adapter or the query
   * parameter used for step navigation).
   */
  $router: RouterModuleOptions

  /**
   * Global security module options.
   */
  $security: SecurityModuleOptions

  /**
   * Global theme module options.
   */
  $theme: ThemeModuleOptions

  /**
   * Global validation module options.
   */
  $validation: ValidationModuleOptions

  /**
   * A vue-router instance for navigation. By default, the router is
   * auto-detected from the Vue app's global `$router` property. Pass `false` to
   * disable router integration entirely.
   */
  router?: VueformRouter | false

  /**
   * Whether the registered `devtools` module is active. `false` turns Vue
   * DevTools integration off entirely. Defaults to `true` — note the module
   * only ever works in development; production builds stay inert regardless.
   */
  devtools: boolean

  /**
   * Registered validation rules keyed by rule name.
   */
  rules: Record<string, RuleDefinition>

  /**
   * Locale definitions keyed by locale name (e.g. `{ en_US }`).
   */
  locales: LocalesProp

  /**
   * The active locale key.
   */
  locale: MaybeRef<string>

  /**
   * Fallback locale key used when a translation is missing.
   */
  fallbackLocale: string

  /**
   * Available languages for multilingual forms.
   */
  languages: LanguagesProp

  /**
   * Responsive breakpoints keyed by name (e.g. `{ sm: '640px' }`).
   */
  breakpoints: Record<string, string | number>

  /**
   * Plugins to apply during installation.
   */
  plugins: VueformPlugin[]

  /**
   * Component registry keyed by component name.
   */
  components: Record<string, VueformComponent>

  /**
   * Whether to use Vue's native emit instead of the custom event system.
   */
  nativeEmit: boolean

  /**
   * The element types `VfMatrix` renders per selection mode. Each value is a
   * tuple: the element type rendered for a single cell, and the
   * holder/container type wrapping a row's cells (e.g. a `radio` inside a
   * `radios` holder for `single` mode).
   */
  matrixTypes: {
    single: [string, string]
    multiple: [string, string]
    auto: [string, string]
  }

  /**
   * Whether to enable CSS grid layout.
   */
  grid: boolean

  /**
   * Whether to inject styles via `@unhead/vue` when available.
   */
  useHead: boolean

  /**
   * CSP nonce to apply to dynamically injected `<style>` tags.
   */
  nonce: string | undefined

  /**
   * Named presets keyed by preset name.
   */
  presets: Record<string, PresetDefinition>

  /**
   * Whether to enable class helper utilities.
   */
  classHelpers: boolean

  /**
   * Function that generates class helper strings from keys.
   */
  classHelper: (key: string) => string

  /**
   * The base theme: a complete token map (e.g. `origin` or `material` from
   * `@vueform/ui/themes`, or one produced by `extendTheme`). Replaces the
   * entry's baked-in theme wholesale — its `dark` block included — so passing a
   * theme to a pre-configured entry switches themes. `tokens` overrides are
   * then merged on top.
   */
  theme?: ThemeTokens

  /**
   * Token overrides merged onto the base theme (the `theme` option, or the
   * entry's baked-in theme): top-level keys replace same-named tokens, and
   * `dark` blocks are shallow-merged (the `extendTheme` semantics). At runtime
   * this holds the fully resolved map — base theme plus overrides.
   */
  tokens: ThemeTokens

  /**
   * Controls how dark mode is detected globally.
   *
   * - `'system'` (default) — follows OS preference via `prefers-color-scheme`.
   *   The CSS dark block is emitted inside a `@media` query.
   * - A CSS subselector string (e.g. `'.dark'`, `'[data-theme="dark"]'`) —
   *   watches `<html>` for that class or attribute. The CSS dark block is
   *   emitted as `:root<subselector> { ... }`.
   */
  darkMode?: DarkModeConfig

  /**
   * Whether to lazily mount element slot content after idle callback. When
   * `false`, elements render their full template immediately without waiting
   * for `requestIdleCallback` or visibility. Default: `true`.
   */
  lazy: boolean

  /**
   * Whether to use mobile-first (min-width) breakpoint logic.
   */
  mobileFirst: boolean

  /**
   * Build-time options that control how Vueform emits assets.
   */
  build: {
    /**
     * The `id` attribute for the injected `<style>` tag. Defaults to
     * `'vueform-style'`.
     */
    styleId: string

    /**
     * When `true`, generates additional scoped CSS blocks that re-declare all
     * theme tokens under `darkClass` and `lightClass`. This enables the `dark`
     * prop on `<VfForm>` to reliably toggle dark mode per-form regardless of
     * the environment. Disabled by default to avoid the extra CSS weight (~5–10
     * KB).
     */
    scopedDarkMode: boolean

    /**
     * CSS class applied to forms with `dark={true}` when `scopedDarkMode` is
     * enabled. Defaults to `'vf-dark'`.
     */
    darkClass: string

    /**
     * CSS class applied to forms with `dark={false}` when `scopedDarkMode` is
     * enabled. Defaults to `'vf-light'`.
     */
    lightClass: string
  }

  /**
   * Whether plain-object prop values provided by the user are merged into
   * object values coming from blueprint defaults, config defaults, and presets.
   * When `false`, user-provided objects replace them entirely. Arrays always
   * replace regardless of this setting, and `classes`/`presets` keep their
   * dedicated merge semantics. Defaults to `true`.
   */
  mergeObjectProps?: boolean

  /**
   * Default prop values per component, with `*` for all components and
   * `*element` for all elements.
   */
  defaults: ComponentDefaultsMap

  /**
   * Per-key overrides for the shared element classes the element layout
   * installs (`root`, `label`, `errors`, …). A key you set replaces that key's
   * layout-provided value at the very bottom of the class chain — every other
   * key keeps the layout's default, and downstream overrides (presets, the
   * `classes`/`reclass` props) still apply on top. Static values given for
   * functional keys (e.g. `root`) are wrapped back into functions.
   */
  layoutClasses?: LayoutClassesMap

  /**
   * Global class overrides per component, with `*` for all components and
   * `*element` for all elements. Functional class keys also accept a plain
   * `ClassValue`.
   */
  reclass: ComponentClassesMap

  /**
   * Callback for custom globals initialization. Receives the same context as
   * plugins' `globals` hooks — the resolved `config` and a read-only view of
   * the `globals` accumulated so far. The returned members are merged into the
   * app's globals; returning a key that already exists overrides it with a dev
   * warning (silence with `globalWarns: false`).
   *
   * @param context The resolved configuration and the accumulated globals.
   */
  globals: (context: GlobalsHookContext) => Partial<VueformGlobals> | void

  /**
   * Whether overriding an existing global from a `globals` hook (config or
   * plugin) logs a dev warning. Defaults to `true`.
   */
  globalWarns: boolean

  /**
   * Unique ID generator for elements.
   */
  uid: () => UID

  /**
   * Generates column CSS class names from size and breakpoint.
   *
   * @param size The column span (1–12).
   * @param breakpoint The breakpoint name.
   */
  cols: (size?: number, breakpoint?: string) => string

  /**
   * Generates label layout CSS class names from size and breakpoint.
   *
   * @param size The label column span.
   * @param breakpoint The breakpoint name.
   */
  label: (size: number, breakpoint?: string) => string

  /**
   * Resolves an icon name into a CSS class string for rendering.
   *
   * @param name The icon identifier.
   */
  icon: (name: string) => string

  /**
   * Semantic icon names mapped to adapter-specific icon identifiers. Used to
   * resolve `$`-prefixed icon names (e.g. `$add`, `$remove`, `$sort`) so
   * built-in controls render the adapter's canonical icons. Mapped values are
   * passed through the `icon` resolver.
   */
  icons: Record<string, string>

  /**
   * Regex pattern used to identify parameter placeholders in locale tag
   * strings. The pattern must contain a single capturing group that extracts
   * the parameter name. Defaults to `{(\w+)}` which matches `{param}` style
   * placeholders.
   */
  localeParamPattern: RegExp

  /**
   * Generates locale tag keys for validation rule error messages.
   *
   * @param name The rule name.
   * @param type The value type variant.
   */
  ruleMessageTag: (name: string, type?: SizeTypes) => string
}

/**
 * The user-facing partial configuration type where all keys are optional except
 * modules and build which are individually optional.
 */
export type UserConfig = PartialDeepKeys<VueformConfig, 'modules' | 'build'>

/**
 * Type-safe helper for authoring Vueform configuration objects — an identity
 * function that only provides typing, like Vite's `defineConfig`.
 *
 * Use it for user configs passed to `createVueform` and for package default
 * configs handed to `createVueformFactory`. Both accept `UserConfig`;
 * completeness of the final config comes from merging entry defaults with the
 * modules each entry requires.
 *
 * @param config Partial Vueform configuration.
 */
export function defineConfig(config: UserConfig): UserConfig {
  return config
}
