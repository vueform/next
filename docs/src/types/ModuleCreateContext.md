```ts
/**
 * The context passed to a module's `create` hook when `createVueform()` creates
 * the registered module definitions' modules.
 */
type ModuleCreateContext = {
  /**
   * The Vueform instance the module belongs to. Its resolved configuration is
   * `vueform.config` — the module's own options live under its `$key` (e.g.
   * `vueform.config.$http`). Modules that depend on other modules resolve them
   * through it lazily, at call time (`getLocaleModule(vueform)`) — never at
   * creation, so creation order is irrelevant.
   */
  vueform: VueformInstance
}
```
