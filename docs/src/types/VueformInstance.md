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
   * `useLocale` bound to this instance — returns the instance's locale module,
   * for code outside components.
   */
  readonly useLocale: typeof useLocale

  /**
   * `useHttp` bound to this instance — creates an http instance over this
   * instance's http module, for code outside components.
   */
  readonly useHttp: typeof useHttp

  /**
   * `useDate` bound to this instance — parses values through this instance's
   * date adapter, for code outside components.
   */
  readonly useDate: typeof useDate

  /**
   * `useSecurity` bound to this instance — returns the instance's security
   * module, for code outside components.
   */
  readonly useSecurity: typeof useSecurity

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
