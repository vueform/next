```ts
/**
 * The date module instance: a factory capturing the configured adapter. `make`
 * parses a value into a `DateInstance`. Per-call state lives in the returned
 * instance, not the module.
 */
interface DateModule {
  /**
   * Parses a value into a `DateInstance`, returning the current date when
   * called without arguments.
   *
   * @param value The date value to parse.
   * @param format Optional format string (requires a date format plugin).
   */
  make: (value?: any, format?: string) => DateInstance
}
```
