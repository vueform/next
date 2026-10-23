```ts
/**
 * Creates a Vueform Vue plugin instance from user-provided configuration merged
 * with the core defaults. The `model` module must be registered; everything
 * else is optional.
 *
 * @param config The user-provided configuration.
 */
function createVueform(
  config: UserConfig & {
    modules: { model: NonNullable<VueformModules['model']> }
  }
): VueformInstance
```
