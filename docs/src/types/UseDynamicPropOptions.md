```ts
/**
 * Options for resolving a dynamic prop.
 */
type UseDynamicPropOptions<V = any, T = any> = {
  /**
   * The component context passed to contextual functions. Falls back to the
   * nearest component context when not provided.
   */
  context$?: any

  /**
   * Overrides the key used when checking whether expressions are allowed. When
   * omitted, defaults to the kebab-case form of the first argument.
   */
  key?: string

  /**
   * Fallback value returned when the prop is `undefined` or resolves to an
   * empty string.
   */
  default?: any

  /**
   * Whether to localize the resolved value through the i18n module.
   */
  localize?: boolean

  /**
   * Whether to run the resolved string through the security module's
   * `sanitizeHtml` when it contains markup.
   */
  sanitize?: boolean

  /**
   * URL schemes the resolved value may carry, without the trailing colon (e.g.
   * `['http', 'https']`). Relative URLs always pass; a value with any other
   * scheme resolves to `undefined`.
   */
  safeUrl?: string[]

  /**
   * Whether to coerce the resolved value to a string. The computed is typed as
   * `string` (never `undefined`).
   */
  string?: boolean

  /**
   * Whether to convert the resolved value to a number.
   */
  number?: boolean

  /**
   * Whether to convert the resolved value to a `Date`.
   */
  date?: boolean

  /**
   * Whether to resolve the value as an icon CSS class string via the config
   * icon resolver.
   */
  icon?: boolean

  /**
   * When truthy, appends a required marker (`*`) to the resolved string.
   */
  required?: MaybeRef<boolean>

  /**
   * Transforms the resolved value before returning. Its return type becomes the
   * computed's value type.
   *
   * @param value The resolved value after expression evaluation.
   */
  transform?: (value: T | (string & {}) | undefined) => V | undefined
}
```
