```ts
/**
 * Context object passed to rule check functions, providing access to the
 * element, form, module instances, and utility helpers.
 */
type RuleContext = {
  /**
   * The element instance being validated.
   */
  el$: StatefulElement

  /**
   * The parent form context, if available.
   */
  form$?: FormContext

  /**
   * The Vueform instance the rule runs under: its `config`, `$locale`, and the
   * module doorways (`getDateModule(vueform)`, `useDate(v, f, vueform)`).
   */
  vueform: VueformInstance

  /**
   * The size-type category of the element (`'string'`, `'number'`, `'array'`,
   * or `'file'`).
   */
  type: SizeTypes

  /**
   * The element's human-readable display name for error messages.
   */
  attribute: string

  /**
   * Returns whether a value is considered non-empty by the element.
   *
   * @param value The value to check.
   */
  filled: (value: any) => boolean

  /**
   * Returns the size of a value according to the element's type (length,
   * numeric value, file size in KB, or array length).
   *
   * @param value The value to measure.
   * @param el$ Optional element to derive the type from.
   */
  size: (value: any, el$?: StatefulElement) => number | undefined

  /**
   * Derives the size-type category for a given element.
   *
   * @param el$ The element to inspect.
   */
  getType: (el$: StatefulElement) => SizeTypes

  /**
   * Looks up another element by path, resolving wildcards relative to the
   * current element.
   *
   * @param path The target element path.
   */
  getOther$: (path: string) => StatefulElement | undefined
}
```
