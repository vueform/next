```ts
/**
 * The resolved Vueform configuration object used internally after merging user
 * config with defaults.
 */
interface VueformConfig {
  /**
   * The registered module definitions keyed by module name.
   */
  modules: VueformModules

  /**
   * Global autosave module options (reserved).
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
```
