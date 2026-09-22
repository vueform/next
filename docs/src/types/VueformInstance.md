````ts
/**
 * The object returned by `createVueform()`. Acts as a Vue plugin and exposes
 * helpers for registering modules/plugins and extracting CSS for SSR.
 */
interface VueformInstance {
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
````
