```ts
/**
 * A plugin factory returned by `definePlugin()`. Every plugin is a function:
 * calling it — with options when the plugin takes any — produces the plugin
 * object passed to the `plugins` config option or `vueform.use()`.
 */
type VueformPluginFactory<Args extends unknown[] = []> = (
  ...args: Args
) => VueformPlugin
```
