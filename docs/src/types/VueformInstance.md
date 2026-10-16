```ts
/**
 * The object returned by `createVueform()`. Acts as a Vue plugin and exposes
 * helpers for registering modules/plugins and extracting CSS for SSR.
 */
interface VueformInstance {
  /**
   * The instance's resolved configuration — the user's config merged with
   * defaults.
   */
  readonly config: VueformConfig

  /**
   * The modules created from `config.modules` at `createVueform()`.
   */
  readonly modules: VueformInstanceModules

  /**
   * The merged component defaults, built lazily on first access.
   */
  readonly defaults: VueformDefaults

  /**
   * The layout globals, extended by the config's and plugins' `globals` hooks.
   */
  readonly globals: VueformGlobals

  /**
   * The locale module bound to this instance — for code outside components.
   */
  readonly $locale: LocaleModule

  /**
   * An http instance bound to this Vueform instance — for code outside
   * components.
   */
  readonly $http: HttpInstance

  /**
   * `useModel` bound to this instance — for code with no component context.
   */
  readonly useModel: typeof useModel

  /**
   * `useForm` bound to this instance — for code with no component context.
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
   * Returns all generated CSS (grid and theme variables) for SSR or manual
   * injection.
   */
  readonly getCSS: () => string

  /**
   * Returns a `<style>` tag with all generated CSS for SSR injection.
   */
  readonly getStyleTag: () => string
}
```
