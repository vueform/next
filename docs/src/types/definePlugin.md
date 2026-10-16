```ts
/**
 * Defines a Vueform plugin that can extend components, config, and globals.
 *
 * Takes a factory producing the plugin's definition — its parameters become the
 * plugin's options — and returns the plugin as a callable factory, so
 * registration is uniform whether or not the plugin takes options: `plugins:
 * [myPlugin()]` or `plugins: [myPlugin({ ... })]`.
 *
 * @param definition A factory producing the plugin's definition — target
 *   components, props, emits, and lifecycle hooks — from the plugin's options.
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
