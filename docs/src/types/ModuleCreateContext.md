```ts
/**
 * The context passed to a module's `create` hook when `createVueform()` creates
 * the registered module definitions' modules.
 */
type ModuleCreateContext = {
  /**
   * The Vueform instance the module belongs to.
   */
  vueform: VueformInstance
}
```
