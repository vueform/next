```ts
/**
 * A plugin factory returned by `definePlugin()`. Calling it produces the plugin
 * object passed to the `plugins` config option.
 */
type VueformPluginFactory<Args extends unknown[] = []> = (
  ...args: Args
) => VueformPlugin
```
