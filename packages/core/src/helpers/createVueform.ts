import { isReactive, isRef, ref, type App } from 'vue'
import {
  type UserConfig,
  type VueformConfig,
  type VueformGlobals,
  type VueformInstanceModules,
  type VueformModules,
} from './defineConfig'
import { extendTheme } from './extendTheme'
import type { HttpInstance } from '#core/modules/http'
import type {
  ComponentNames,
  NormalizedPresetDefinition,
  PresetDefinition,
  VueformComponent,
} from '#core/types'
import type { VueformModule } from './defineModule'
import type { VueformPlugin } from './definePlugin'
import {
  shouldApplyPlugin,
  useForm,
  useHttp,
  type useModel,
} from '#core/composables'
import { defaultConfig } from '#core/config'
import { createVueformContext } from '#core/contexts'
import { getLocaleModule, type LocaleModule } from '#core/modules/locale'
import { mergeProp, normalizePreset, warn, isDev } from '#core/utils'

// @todo: shouldn't this be moved into helpers?

declare module 'vue' {
  interface App {
    /**
     * Workaround for a Vue 3.5 + TS 5.8+ bug where `ObjectPlugin` does not
     * match the `Plugin` union in `app.use()`.
     */
    use(
      plugin: { install: (app: App, ...args: any[]) => any },
      ...options: any[]
    ): this
  }
}

/**
 * The merged component defaults of an instance: prop values keyed by component
 * name, layered from the config's `*`, `*element`, and per-component
 * `defaults`.
 */
export type VueformDefaults = Record<ComponentNames, Record<string, any>>

/**
 * The object returned by `createVueform()`. Acts as a Vue plugin and exposes
 * helpers for registering modules/plugins and extracting CSS for SSR.
 */
export interface VueformInstance {
  /**
   * The instance's resolved configuration — the user's config merged with
   * defaults, same shape (`config.modules` holds the registered module
   * definitions).
   */
  readonly config: VueformConfig

  /**
   * The modules created from `config.modules` at `createVueform()` — what
   * doorways and composables read. Module doorways and composables accept the
   * instance itself to resolve them outside a component context (e.g.
   * `getLocaleModule(vueform)`).
   */
  readonly modules: VueformInstanceModules

  /**
   * The merged component defaults (`config.defaults` layered per component),
   * built lazily on first access.
   */
  readonly defaults: VueformDefaults

  /**
   * The layout globals, extended by the config's and plugins' `globals` hooks,
   * built lazily on first access.
   */
  readonly globals: VueformGlobals

  /**
   * The locale module (or its inert surface when not registered) — for code
   * outside components: `vueform.$locale.t('tag')`. Mirrors the component
   * context's `$locale`.
   */
  readonly $locale: LocaleModule

  /**
   * An http instance bound to this Vueform instance (one per instance, own
   * interceptor scope) — for code outside components. Mirrors the component
   * context's `$http`; without the http module its requests reject.
   */
  readonly $http: HttpInstance

  /**
   * `useModel` bound to this instance — for code with no component context:
   * stores, utilities, server code, module scope. Same signature and typing as
   * the `useModel` composable, which resolves the calling component's instance
   * instead.
   *
   * ```ts
   * import { vueform } from '@/vueform'
   * const model$ = vueform.useModel(schema, saved)
   * ```
   */
  readonly useModel: typeof useModel

  /**
   * `useForm` bound to this instance — for code with no component context. Same
   * signature and typing as the `useForm` composable.
   */
  readonly useForm: typeof useForm

  /**
   * Vue plugin install hook. Called automatically by `app.use()`.
   *
   * @param app The Vue application instance to install into.
   */
  readonly install: (app: App, ...options: any[]) => any

  /**
   * Registers a module implementation before Vueform is installed. Throws if
   * called after installation.
   *
   * @param name The module key to register.
   * @param module The module implementation.
   */
  readonly module: <T extends keyof VueformModules>(
    name: T,
    module: NonNullable<VueformModules[T]>
  ) => void

  /**
   * Registers a Vueform plugin before installation. Throws if called after
   * installation.
   *
   * @param plugin The plugin to register.
   */
  readonly use: (plugin: VueformPlugin) => void

  /**
   * Returns all generated CSS (grid + theme variables) for SSR or manual
   * injection.
   */
  readonly getCSS: () => string

  /**
   * Returns a `<style>` tag for SSR injection covering both the grid layout and
   * theme variable declarations.
   */
  readonly getStyleTag: () => string
}

/**
 * Builds an instance's merged component defaults from its configuration. Held
 * on the instance (`vueform.defaults`) and built lazily on first access.
 *
 * @param config The resolved Vueform configuration.
 */
/**
 * Dev-only deep freeze of the resolved config after install completes, so an
 * accidental post-install mutation (`config.$security.sanitize = false` from
 * app code) throws loudly in development instead of silently changing policy.
 * Not a security boundary — code that can mutate the config can already do
 * anything — purely a footgun guard, so production is untouched.
 *
 * Branches Vue or Vueform legitimately mutate at runtime are skipped:
 * `components` (Vue caches compiled render functions on definition objects),
 * `plugins` and `modules` (registration arrays/maps), and any ref/reactive
 * member (`locale` switching must keep working).
 */
function freezeConfigDev(config: VueformConfig) {
  const skip = new Set(['components', 'plugins', 'modules', 'globals', 'rules'])

  const deepFreeze = (value: any) => {
    if (
      value == null ||
      typeof value !== 'object' ||
      isRef(value) ||
      isReactive(value) ||
      Object.isFrozen(value)
    ) {
      return
    }

    Object.freeze(value)

    for (const key of Object.keys(value)) {
      deepFreeze(value[key])
    }
  }

  for (const key of Object.keys(config)) {
    if (skip.has(key)) continue
    deepFreeze((config as Record<string, any>)[key])
  }

  Object.freeze(config)
}

function createDefaults(config: VueformConfig): VueformDefaults {
  const configDefaults = config.defaults || {}
  const components = Object.keys(config.components).filter(
    (comp) => !comp.includes('_')
  ) as ComponentNames[]
  const defaults: VueformDefaults = {} as VueformDefaults

  for (const componentName of components) {
    defaults[componentName] = {}

    const layers = [configDefaults['*']]

    if (config.components[componentName].element) {
      layers.push(configDefaults['*element'])
    }

    layers.push(configDefaults[componentName])

    // Merge layer by layer, per prop, so prop-specific merge rules apply
    // (`classes` merges via mergeClasses, `presets` concatenates, plain
    // objects shallow-merge, scalars replace).
    for (const layer of layers) {
      if (!layer) continue

      for (const propName in layer) {
        defaults[componentName][propName] = mergeProp(
          defaults[componentName][propName],
          (layer as Record<string, any>)[propName],
          propName
        )
      }
    }
  }

  return defaults
}

/**
 * Recursively applies plugin config callbacks to the Vueform configuration.
 *
 * @param plugin The plugin whose config callback should be applied.
 * @param config The Vueform configuration to mutate.
 */
function applyPluginConfigs(
  { config: configPlugin, plugins }: VueformPlugin,
  config: VueformConfig
) {
  if (typeof configPlugin === 'function') {
    configPlugin(config)
  }

  plugins?.forEach((plugin) => applyPluginConfigs(plugin, config))
}

/**
 * Merges a `globals` hook's returned members into the accumulated globals.
 * Overriding an existing member warns in development unless the config opts out
 * (`globalWarns: false`); the later value wins either way.
 *
 * @param target The accumulated globals.
 * @param source A hook's returned members.
 * @param config The Vueform configuration.
 */
function assignGlobals(
  target: Partial<VueformGlobals>,
  source: Partial<VueformGlobals> | void,
  config: VueformConfig
) {
  if (!source) return

  for (const key of Object.keys(source)) {
    if (isDev() && config.globalWarns !== false && key in target) {
      warn(
        `[vueform] Global "${key}" is defined more than once — the later ` +
          'value wins. Silence this warning with `globalWarns: false`.'
      )
    }

    ;(target as Record<string, unknown>)[key] = (
      source as Record<string, unknown>
    )[key]
  }
}

/**
 * Recursively merges plugin globals callbacks' returns.
 *
 * @param plugin The plugin whose globals callback should be applied.
 * @param config The Vueform configuration.
 * @param globals The accumulated globals.
 */
function applyPluginGlobals(
  { globals: globalsPlugin, plugins }: VueformPlugin,
  config: VueformConfig,
  globals: VueformGlobals
) {
  if (typeof globalsPlugin === 'function') {
    assignGlobals(globals, globalsPlugin({ config, globals }), config)
  }

  plugins?.forEach((plugin) => applyPluginGlobals(plugin, config, globals))
}

/**
 * Chains the entry's and the user's `globals` hooks so both returns merge — a
 * plain config merge would let the user's hook replace the entry's (and with it
 * the base values the default config contributes). Overrides between the two
 * warn via `assignGlobals`.
 *
 * @param base The entry default config's hook.
 * @param user The user config's hook.
 */
function composeGlobalsHooks(
  base: VueformConfig['globals'] | undefined,
  user: VueformConfig['globals'] | undefined
): VueformConfig['globals'] | undefined {
  if (!base || !user) return base ?? user

  return ({ config, globals: current }) => {
    const merged: Partial<VueformGlobals> = {}
    assignGlobals(merged, base({ config, globals: current }), config)
    assignGlobals(
      merged,
      user({ config, globals: { ...current, ...merged } }),
      config
    )
    return merged
  }
}

/**
 * Recursively runs plugin install hooks (app-side effects such as directive
 * registration) when the instance is installed into an app.
 *
 * @param plugin The plugin whose install hook should run.
 * @param app The Vue application instance.
 * @param vueform The Vueform instance being installed.
 */
function applyPluginInstall(
  { install, plugins }: VueformPlugin,
  app: App,
  vueform: VueformInstance
) {
  install?.({ app, vueform })

  plugins?.forEach((plugin) => applyPluginInstall(plugin, app, vueform))
}

/**
 * Recursively extends component props and emits from plugin definitions.
 *
 * Component definitions are shared module objects (the same `VfText` is
 * imported by every instance), so they are never mutated: the first plugin that
 * touches a component replaces the instance's entry with a shallow clone
 * (copy-on-write, tracked in `cloned`) and later plugins extend that clone.
 *
 * @param plugin The plugin providing additional props and emits.
 * @param components The instance's component map to extend.
 * @param cloned The component names already cloned for this instance.
 */
function applyPluginPropsAndEmits(
  { apply, props, emits, plugins }: VueformPlugin,
  components: Record<string, VueformComponent>,
  cloned: Set<string>
) {
  if (apply && (props || emits)) {
    for (const [name, component] of Object.entries(components)) {
      if (typeof component === 'function') continue
      if (!shouldApplyPlugin(apply, component)) continue

      let target = component

      if (!cloned.has(name)) {
        target = { ...component }
        components[name] = target
        cloned.add(name)
      }

      if (props) {
        target.props = {
          ...target.props,
          ...props,
        }
      }

      if (emits) {
        target.emits = [...(target.emits ?? []), ...emits]
      }
    }
  }

  plugins?.forEach((plugin) =>
    applyPluginPropsAndEmits(plugin, components, cloned)
  )
}

/**
 * Normalizes all preset definitions in a record to their array form.
 *
 * @param definitions Raw preset definitions keyed by name.
 */
function normalizePresetDefinitions(
  definitions: Record<string, PresetDefinition>
) {
  const normalized: Record<string, NormalizedPresetDefinition[]> = {}

  for (const key in definitions) {
    normalized[key] = normalizePreset(definitions[key]) as any
  }

  return normalized
}

/**
 * Resolves and normalizes a Vueform config by processing presets and the class
 * helper.
 *
 * @param conf The raw Vueform configuration.
 */
function mergeConfig(conf: VueformConfig): VueformConfig {
  const config = { ...conf }

  if (config.presets) {
    config.presets = normalizePresetDefinitions(config.presets)
  }

  config.classHelper = (path) => conf.classHelper(path).replace(/\s/g, '')

  return config
}

/**
 * Collects and joins the CSS contributed by every registered module that
 * defines a `getCSS` hook (e.g. the theme module's grid and token variable
 * declarations).
 *
 * @param config The resolved Vueform configuration.
 */
function collectModuleCSS(
  definitions: VueformModules,
  vueform: VueformInstance
): string {
  return Object.values(definitions)
    .map((definition) => definition?.getCSS?.({ vueform }))
    .filter(Boolean)
    .join('\n\n')
}

/**
 * Creates a `createVueform` entry function around a set of default options.
 *
 * `TRequired` lists the modules the produced `createVueform` demands from its
 * caller. Bare entries that bundle nothing pass `<'model'>` — `model` has no
 * noop and must be registered. Theme entries that already register every module
 * pass none and get a fully optional argument.
 *
 * Structural CSS (the visual layer that consumes the token variables) is
 * expected to be loaded as a side effect by the adapter -- typically by the
 * adapter's theme file importing its SCSS entry. The factory itself only
 * injects the dynamic `:root { --vf-*: ... }` declarations derived from
 * `config.tokens`.
 *
 * @param defaultOptions The entry's default configuration.
 */
export function createVueformFactory<
  TRequired extends keyof VueformModules = never,
>(defaultOptions: UserConfig) {
  return function createVueform(
    ...args: [TRequired] extends [never]
      ? [config?: UserConfig]
      : [
          config: UserConfig & {
            modules: {
              [K in TRequired]-?: NonNullable<VueformModules[K]>
            }
          },
        ]
  ): VueformInstance {
    const userConfig = (args[0] ?? {}) as UserConfig

    /**
     * Whether the instance has been installed into at least one app — after
     * that, `module()` / `use()` are rejected.
     */
    let $installed = false

    /**
     * The apps this instance is installed into: an instance may serve several
     * apps, each getting its own provide/registration pass exactly once.
     */
    const installedApps = new WeakSet<App>()

    /**
     * Component names whose definitions were cloned for this instance by plugin
     * props/emits extension (copy-on-write over the shared imports).
     */
    const clonedComponents = new Set<string>()

    // The only place a partial config is promoted to `VueformConfig`:
    // completeness comes from the entry's defaults plus the modules
    // `TRequired` forces the caller to provide.
    // The app's `theme` replaces the entry's baked-in one; `tokens` at every
    // layer are overrides merged on top of whichever base wins.
    const baseTheme = userConfig.theme ?? defaultOptions.theme

    const merged = {
      ...defaultOptions,
      ...userConfig,
      locale: ref(userConfig.locale || defaultOptions.locale),
      globals: composeGlobalsHooks(defaultOptions.globals, userConfig.globals),
      components: {
        ...defaultOptions.components,
        ...userConfig.components,
      },
      modules: {
        ...defaultOptions.modules,
        ...userConfig.modules,
      },
      icons: {
        ...defaultOptions.icons,
        ...userConfig.icons,
      },
      build: {
        ...defaultOptions.build,
        ...userConfig.build,
      },
      plugins: [
        ...(defaultOptions.plugins ?? []),
        ...(userConfig.plugins ?? []),
      ],
      // The base theme is picked wholesale — the app's `theme` replaces the
      // entry's baked-in one entirely (dark block included). Token overrides
      // are cumulative on top of it: the entry's `tokens` (default overrides,
      // if it ships any) persist under the app's (top-level keys replace,
      // `dark` blocks shallow-merge), and the resolved map is what
      // `config.tokens` holds at runtime.
      theme: baseTheme,
      tokens: extendTheme(
        baseTheme ?? {},
        extendTheme(defaultOptions.tokens ?? {}, userConfig.tokens ?? {})
      ),
      // Module option bags are shallow-merged so a per-app override
      // (e.g. `$http: { baseURL }`) doesn't drop preset-baked adapters
      // (`$date.adapter`, `$http.adapter`).
      $conditions: {
        ...defaultOptions.$conditions,
        ...userConfig.$conditions,
      },
      $date: {
        ...defaultOptions.$date,
        ...userConfig.$date,
      },
      $devtools: {
        ...defaultOptions.$devtools,
        ...userConfig.$devtools,
      },
      $expression: {
        ...defaultOptions.$expression,
        ...userConfig.$expression,
      },
      $http: {
        ...defaultOptions.$http,
        ...userConfig.$http,
      },
      $locale: {
        ...defaultOptions.$locale,
        ...userConfig.$locale,
      },
      $model: {
        ...defaultOptions.$model,
        ...userConfig.$model,
      },
      $router: {
        ...defaultOptions.$router,
        ...userConfig.$router,
      },
      $security: {
        ...defaultOptions.$security,
        ...userConfig.$security,
      },
      $theme: {
        ...defaultOptions.$theme,
        ...userConfig.$theme,
      },
      $validation: {
        ...defaultOptions.$validation,
        ...userConfig.$validation,
      },
    } as unknown as VueformConfig

    const config = mergeConfig(merged)

    if (!config.modules.model) {
      throw new Error(
        'The `model` module is required. Register it via ' +
          '`createVueform({ modules: { model } })`.'
      )
    }

    // Plugins may extend the config (e.g. register an expression adapter) —
    // applied before the modules are created from it.
    config.plugins.forEach((plugin) => applyPluginConfigs(plugin, config))

    // Extend components from plugins (per-instance clones, see
    // `applyPluginPropsAndEmits`).
    config.plugins.forEach((plugin) =>
      applyPluginPropsAndEmits(plugin, config.components, clonedComponents)
    )

    /**
     * The modules created from `config.modules`. Filled after the instance
     * object exists so `create` hooks can capture it; cross-module access
     * happens lazily at call time, so creation order is irrelevant.
     */
    const modules = {} as VueformInstanceModules

    /**
     * Creates a module from its definition onto `modules`. Misconfiguration
     * (something that isn't a `defineModule()` definition) fails here, at
     * `createVueform()`, with the module's name.
     */
    const instantiate = (name: string, definition: VueformModule<unknown>) => {
      if (typeof definition.create !== 'function') {
        throw new Error(
          `Module "${name}" must be a definition created with defineModule() ` +
            '(missing create()).'
        )
      }

      ;(modules as unknown as Record<string, unknown>)[name] =
        definition.create({ vueform })
    }

    let $http: HttpInstance | undefined
    let $defaults: VueformDefaults | undefined
    let $globals: VueformGlobals | undefined

    const vueform: VueformInstance = {
      config,
      modules,

      get defaults() {
        return ($defaults ??= createDefaults(config))
      },

      get globals() {
        if (!$globals) {
          $globals = {} as VueformGlobals
          assignGlobals(
            $globals,
            config.globals?.({ config, globals: $globals }),
            config
          )
          config.plugins.forEach((plugin) =>
            applyPluginGlobals(plugin, config, $globals!)
          )
        }

        return $globals
      },

      get $locale() {
        return getLocaleModule(vueform)
      },

      get $http() {
        return ($http ??= useHttp(vueform))
      },

      useModel: ((schema, model, validationSchema) =>
        modules.model.make(schema, model, validationSchema)) as typeof useModel,

      useForm: ((formProps?: Record<string, any>, model?: any) =>
        useForm(formProps, model, vueform)) as typeof useForm,

      /**
       * Vue plugin install hook that registers components, injects global
       * contexts, and applies plugin extensions. Called automatically by
       * `app.use()`.
       *
       * @param app The Vue application instance to install into.
       */
      install: (app: App) => {
        if (installedApps.has(app)) return
        installedApps.add(app)

        app.runWithContext(() => {
          // Provide the instance app-wide
          createVueformContext(vueform, app)

          // Run module app-side effects (e.g. theme style injection)
          for (const definition of Object.values(config.modules)) {
            definition?.install?.({ app, vueform })
          }

          // Register global components
          Object.entries(config.components).forEach(([name, component]) =>
            app.component(name, component)
          )

          // Plugin app-side effects (e.g. directives)
          config.plugins.forEach((plugin) =>
            applyPluginInstall(plugin, app, vueform)
          )
        })

        $installed = true

        if (isDev()) {
          freezeConfigDev(config)
        }
      },

      /**
       * Registers a module implementation before Vueform is installed. Throws
       * if called after installation.
       *
       * @param name The module key to register.
       * @param module The module implementation.
       */
      module: <T extends keyof VueformModules>(
        name: T,
        module: NonNullable<VueformModules[T]>
      ) => {
        if ($installed) {
          throw new Error(
            'Cannot register a module after Vueform has been installed'
          )
        }

        config.modules[name] = module
        instantiate(name, module)
      },

      /**
       * Registers a Vueform plugin before installation. Throws if called after
       * installation.
       *
       * @param plugin The plugin to register.
       */
      use: (plugin: VueformPlugin) => {
        if ($installed) {
          throw new Error(
            'Cannot register a plugin after Vueform has been installed'
          )
        }

        config.plugins.push(plugin)
        applyPluginPropsAndEmits(plugin, config.components, clonedComponents)
      },

      /**
       * Returns all generated CSS (grid + theme variables) for SSR or manual
       * injection, collected from every registered module that defines
       * `getCSS`.
       */
      getCSS: () => collectModuleCSS(config.modules, vueform),

      /**
       * Returns a `<style>` tag for SSR injection covering both the grid layout
       * and theme variable declarations.
       */
      getStyleTag: () => {
        const css = collectModuleCSS(config.modules, vueform)
        if (!css) return ''
        const nonceAttr = config.nonce ? ` nonce="${config.nonce}"` : ''
        // The returned string is spliced into raw SSR HTML: escape `</` so no
        // CSS content can close the style element early (`<\/` is a valid CSS
        // string escape and `</` is never legitimate CSS outside strings).
        return `<style id="${config.build.styleId}"${nonceAttr}>${css.replace(/<\//g, '<\\/')}</style>`
      },
    }

    for (const [name, definition] of Object.entries(config.modules)) {
      if (definition) instantiate(name, definition)
    }

    // A configured `$<module>` options block whose module isn't registered is
    // a misconfiguration: the options read as if they were in effect, but
    // nothing consumes them. Warn at creation so the mismatch is visible
    // immediately — not only when (or if) a noop capability happens to be
    // consulted. Every `$`-prefixed config key is a module options bag by
    // convention (custom modules included), so the keys are discovered, not
    // enumerated. Checked against the literal user config: entry and core
    // defaults ship populated option bags (`$http`, `$conditions`) as
    // library baseline, which is not user intent.
    if (isDev()) {
      for (const key of Object.keys(userConfig)) {
        if (!key.startsWith('$')) continue

        const name = key.slice(1)
        const options = (userConfig as Record<string, any>)[key]

        if (
          !(modules as unknown as Record<string, unknown>)[name] &&
          options &&
          typeof options === 'object' &&
          Object.keys(options).length
        ) {
          warn(
            `\`${key}\` options are configured but the \`${name}\` module is not registered — the module's features are unavailable and the options are not applied. Register it via \`createVueform({ modules: { ${name} } })\`.`
          )
        }
      }
    }

    return vueform
  }
}

/**
 * Creates a Vueform Vue plugin instance from user-provided configuration merged
 * with the core defaults. Core bundles no modules or locales, so the `model`
 * module must be registered (everything else is optional and tree-shaken when
 * omitted).
 */
export const createVueform = createVueformFactory<'model'>(defaultConfig)
