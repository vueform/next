import type { ComputedRef, MaybeRef } from 'vue'

import type {
  AutosaveModule,
  AutosaveModuleOptions,
} from '#src/modules/autosave'
import type {
  ConditionsModule,
  ConditionsModuleOptions,
} from '#src/modules/conditions'
import type { DateModule, DateModuleOptions } from '#src/modules/date'
import type {
  DevtoolsModule,
  DevtoolsModuleOptions,
} from '#src/modules/devtools'
import type {
  ExpressionModule,
  ExpressionModuleOptions,
} from '#src/modules/expression'
import type { HttpModule, HttpModuleOptions } from '#src/modules/http'
import type { LocaleModule, LocaleModuleOptions } from '#src/modules/locale'
import type { ModelModule, ModelModuleOptions } from '#src/modules/model'
import type {
  RouterModule,
  RouterModuleOptions,
  VueformRouter,
} from '#src/modules/router'
import type {
  SecurityModule,
  SecurityModuleOptions,
} from '#src/modules/security'
import type {
  DarkModeConfig,
  ThemeModule,
  ThemeModuleOptions,
} from '#src/modules/theme'
import type {
  SizeTypes,
  RuleDefinition,
  ValidationModule,
  ValidationModuleOptions,
} from '#src/modules/validation'
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
} from '#src/types'

import type { VueformModule } from './defineModule'
import type { VueformPlugin } from './definePlugin'

/**
 * The registered Vueform module implementations.
 */
export interface VueformModules {
  /**
   * The autosave module for remote interval/event form saving and drafts.
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
 * The modules of a Vueform instance (`vueform.modules`), created by
 * `createVueform()` from the definitions registered in `config.modules`.
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
   * The model module — required, so the instance always carries it.
   */
  model: ModelModule
}

/**
 * Global layout values derived from the Vueform configuration, held on the
 * instance (`vueform.globals`).
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
   * The globals accumulated so far. Read-only — return members to add or
   * override.
   */
  globals: Readonly<Partial<VueformGlobals>>
}

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

/**
 * The resolved Vueform configuration object used internally after merging user
 * config with defaults.
 */
export interface VueformConfig {
  /**
   * The registered module definitions keyed by module name.
   */
  modules: VueformModules

  /**
   * Global autosave module options (e.g. the default draft `storage`).
   */
  $autosave: AutosaveModuleOptions

  /**
   * Global conditions options controlling structured condition strictness and
   * async condition re-evaluation.
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
   * Whether the registered `devtools` module is active. Pass `false` to turn
   * Vue DevTools integration off entirely. Defaults to `true`.
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
   * The element types `VfMatrix` renders per selection mode, as tuples of cell
   * element type and row holder type.
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
   * The base theme: a complete token map. Replaces the entry's baked-in theme
   * wholesale; `tokens` overrides are then merged on top.
   */
  theme?: ThemeTokens

  /**
   * Token overrides merged onto the base theme: top-level keys replace
   * same-named tokens, and `dark` blocks are shallow-merged.
   */
  tokens: ThemeTokens

  /**
   * Controls how dark mode is detected globally: `'system'` (default) follows
   * the OS preference, or a CSS subselector string (e.g. `'.dark'`) watches
   * `<html>` for that class or attribute.
   */
  darkMode?: DarkModeConfig

  /**
   * Whether to lazily mount element slot content after idle callback. Defaults
   * to `true`.
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
     * When `true`, generates additional scoped CSS blocks so the `dark` prop on
     * `<VfForm>` can toggle dark mode per-form. Disabled by default.
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
   * object values coming from defaults and presets. When `false`, user-provided
   * objects replace them entirely. Defaults to `true`.
   */
  mergeObjectProps?: boolean

  /**
   * Default prop values per component, with `*` for all components and
   * `*element` for all elements.
   */
  defaults: ComponentDefaultsMap

  /**
   * Per-key overrides for the shared element classes the element layout
   * installs (`root`, `label`, `errors`, …).
   */
  layoutClasses?: LayoutClassesMap

  /**
   * Global class overrides per component, with `*` for all components and
   * `*element` for all elements. Functional class keys also accept a plain
   * `ClassValue`.
   */
  reclass: ComponentClassesMap

  /**
   * Callback for custom globals initialization. The returned members are merged
   * into the app's globals.
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
   * Semantic icon names (e.g. `$add`, `$remove`) mapped to adapter-specific
   * icon identifiers.
   */
  icons: Record<string, string>

  /**
   * Regex pattern used to identify parameter placeholders in locale tag
   * strings, with a single capturing group extracting the parameter name.
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
 * The user-facing configuration type where all keys are optional.
 */
export type UserConfig = PartialDeepKeys<VueformConfig, 'modules' | 'build'>

/**
 * Type-safe helper for authoring Vueform configuration objects — an identity
 * function that only provides typing.
 *
 * @param config Partial Vueform configuration.
 */
export function defineConfig(config: UserConfig): UserConfig {
  return config
}
