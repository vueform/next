```ts
/**
 * The context passed to a plugin's `install` hook when Vueform is installed
 * into a Vue app.
 */
type PluginInstallContext = {
  /**
   * The Vue application instance Vueform is being installed into.
   */
  app: App

  /**
   * The Vueform instance being installed.
   */
  vueform: VueformInstance
}
```
