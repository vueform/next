```ts
/**
 * A plugin factory returned by `definePlugin()`. Calling it produces the plugin
 * object passed to the `plugins` config option or `vueform.use()`.
 */
type VueformPluginFactory<Args extends unknown[] = []> = (
  ...args: Args
) => VueformPlugin
```
