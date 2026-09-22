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
   * Whether to localize the resolved value. When enabled, strings and locale
   * record objects are passed through the locale module before further
   * processing.
   */
  localize?: boolean

  /**
   * Whether to run the resolved string through the security module's
   * `sanitizeHtml` — only when it actually contains markup (`containsHtml`), so
   * plain text never touches the engine (no mangling of comparisons like `score
   * < 10`, and no interaction with the engineless production fallback). Runs
   * after localization and expression resolution, so the sanitizer sees the
   * final bytes.
   */
  sanitize?: boolean

  /**
   * URL schemes the resolved value may carry, without the trailing colon (e.g.
   * `['http', 'https']`). Relative URLs always pass; a value with any other
   * scheme — `javascript:` above all — resolves to `undefined` with a dev
   * warning (the security module's `sanitizeUrl`; without the module, URLs pass
   * through unchecked). Validation runs on the final string, after localization
   * and expression resolution.
   */
  safeUrl?: string[]

  /**
   * Whether to coerce the resolved value to a string. When enabled and no
   * `transform` is provided, `undefined` and empty values become `''` and all
   * other values are passed through `String()`. The computed is typed as
   * `string` (never `undefined`).
   */
  string?: boolean

  /**
   * Whether to convert the resolved value to a number. When enabled and no
   * `transform` is provided, empty or undefined values resolve to `undefined`
   * and all other values are passed through `Number()`.
   */
  number?: boolean

  /**
   * Whether to convert the resolved value to a `Date`. When enabled and no
   * `transform` is provided, string values are passed through `new Date()` and
   * non-string values are returned as-is.
   */
  date?: boolean

  /**
   * Whether to resolve the value as an icon CSS class string via the config
   * icon resolver. When enabled and no `transform` is provided, string values
   * are resolved through the config icon helper (`$`-prefixed names are mapped
   * through the semantic `config.icons` map first) and non-string values
   * resolve to `undefined`.
   */
  icon?: boolean

  /**
   * When truthy, appends a required marker (`*`) to the resolved string. The
   * caller decides whether the marker should appear — pass a ref or computed
   * that encodes that decision.
   */
  required?: MaybeRef<boolean>

  /**
   * Transforms the resolved value before returning. When provided, replaces the
   * default `normalize` step and its return type becomes the computed's value
   * type.
   *
   * @param value The resolved value after expression evaluation.
   */
  transform?: (value: T | (string & {}) | undefined) => V | undefined
}
```
