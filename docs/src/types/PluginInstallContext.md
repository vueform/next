```ts
/**
 * The context passed to a plugin's `install` hook when Vueform is installed
 * into a Vue app — the same shape a module's `install` hook receives.
 */
type PluginInstallContext = {
  /**
   * The Vue application instance Vueform is being installed into.
   */
  app: App

  /**
   * The Vueform instance being installed — its resolved configuration is
   * `vueform.config`.
   */
  vueform: VueformInstance
}
```
