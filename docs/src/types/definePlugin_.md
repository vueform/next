```ts
/**
 * Defines a Vueform plugin that can extend components, config, and globals.
 * Takes a factory producing the plugin's definition and returns the plugin as a
 * callable factory.
 *
 * @param definition A factory producing the plugin's definition from the
 *   plugin's options.
 */
function definePlugin<Args extends unknown[], T extends PluginApplyName>(
  definition: (...args: Args) => VueformPluginOptions<T>
): VueformPluginFactory<Args>

/**
 * Defines a Vueform plugin whose `apply` is a predicate function for custom
 * component matching.
 *
 * @param definition A factory producing the plugin's definition — a custom
 *   `apply` predicate, props, emits, and lifecycle hooks — from the plugin's
 *   options.
 */
function definePlugin<Args extends unknown[]>(
  definition: (...args: Args) => VueformPluginOptionsWithApplyFn
): VueformPluginFactory<Args>
```
