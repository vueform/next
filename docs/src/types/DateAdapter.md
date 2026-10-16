```ts
/**
 * A factory that produces the date module's `make` function from the module
 * options (`config.$date`).
 */
type DateAdapter = (options?: DateModuleOptions) => DateModule['make']
```
