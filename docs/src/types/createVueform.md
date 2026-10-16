```ts
/**
 * Creates a Vueform Vue plugin instance from user-provided configuration merged
 * with the core defaults. The `model` module must be registered; everything
 * else is optional.
 */
const createVueform: (
  config: Partial<Omit<VueformConfig, 'modules' | 'build'>> & {
    modules?: Partial<VueformModules> | undefined
    build?:
      | Partial<{
          styleId: string
          scopedDarkMode: boolean
          darkClass: string
          lightClass: string
        }>
      | undefined
  } & { modules: { model: VueformModule<ModelModule> } }
) => VueformInstance
```
