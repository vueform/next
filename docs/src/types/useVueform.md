```ts
/**
 * Returns the Vueform instance of the calling component's app — its `config`
 * and created `modules`. Setup-only — throws `NotInstalledError` outside a
 * component context; code with no component holds its `createVueform()`
 * instance already.
 */
function useVueform(): VueformInstance
```
