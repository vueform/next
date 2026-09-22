```ts
/**
 * Resolves the modules of the instance a call should read from — the shared
 * first step of every module doorway (`getXModule(vueform?)` reads
 * `resolveModules(vueform).x ?? noopX`). See `resolveVueform` for the
 * resolution order and failure mode.
 *
 * @param vueform Explicit instance, when the caller passed one.
 */
function resolveModules(vueform?: VueformInstance): VueformInstanceModules
```
