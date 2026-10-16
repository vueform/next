```ts
/**
 * Creates a date module from the given app config (uses `$date.adapter`).
 * `make` produces a new `DateInstance`, throwing when no adapter is
 * configured.
 *
 * @param config The app config (only `$date` is used).
 */
function createDate(vueform: VueformInstance): DateModule
```
