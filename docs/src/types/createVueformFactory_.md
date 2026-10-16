```ts
/**
 * Creates a `createVueform` entry function around a set of default options.
 * `TRequired` lists the modules the produced `createVueform` requires from its
 * caller.
 *
 * @param defaultOptions The entry's default configuration.
 */
function createVueformFactory<TRequired extends keyof VueformModules = never>(
  defaultOptions: UserConfig
): (
  ...args: [TRequired] extends [never]
    ? [config?: UserConfig]
    : [
        config: UserConfig & {
          modules: { [K in TRequired]-?: NonNullable<VueformModules[K]> }
        },
      ]
) => VueformInstance
```
