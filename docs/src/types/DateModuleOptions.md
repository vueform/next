```ts
/**
 * Configuration options for the date module (`config.$date`).
 */
interface DateModuleOptions {
  /**
   * The date adapter — `nativeDateAdapter` (from `@vueform/core`), a date
   * library adapter (`@vueform/date-dayjs`, `@vueform/date-fns`,
   * `@vueform/date-luxon`), or a custom one. Required: `make` throws when
   * unset, so unused adapters are never bundled.
   */
  adapter?: DateAdapter
}
```
