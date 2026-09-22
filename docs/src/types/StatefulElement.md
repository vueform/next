```ts
/**
 * Describes the shape of an element that carries form state, used internally
 * for validation and data handling.
 */
interface StatefulElement {
  /**
   * The element's field name.
   */
  name: string | number

  /**
   * The element's dot-separated path in the form data tree.
   */
  path: string

  /**
   * The element's dot-separated path used for data submission.
   */
  dataPath: string

  /**
   * A human-readable display name for the element, used in validation messages.
   */
  genericName: string

  /**
   * The element's current value.
   */
  value: any

  /**
   * The element's bound model value.
   */
  model: any

  /**
   * The element's submission payload keyed by field name.
   */
  payload: Record<string, any>

  /**
   * Whether the element is a static (non-data) element.
   */
  isStatic: boolean

  /**
   * Whether the element is currently visible and active based on conditions.
   */
  available: boolean

  /**
   * Whether the element has been interacted with by the user.
   */
  touched: boolean

  /**
   * Whether the element has been validated at least once.
   */
  validated: boolean

  /**
   * Whether the element currently has validation errors.
   */
  invalid: boolean

  /**
   * Whether the element has pending async validations.
   */
  pending: boolean

  /**
   * Whether the element's input is currently being debounced.
   */
  debouncing: boolean

  /**
   * Whether the element's value is considered empty.
   */
  empty: boolean

  /**
   * Whether the element is completed, meaning it either has no rules or has
   * been validated without errors.
   */
  completed: boolean

  /**
   * Whether the element's children should be flattened in the data output.
   */
  flat?: boolean

  /**
   * Whether the element is a container whose data is flattened into its
   * parent's level rather than nested under its own key (e.g. a group with
   * `nested: false`).
   */
  isFlatContainer?: boolean

  /**
   * Whether this element pushes its errors to its nearest ancestor element.
   * When enabled, the element does not display or report its own errors; the
   * ancestor includes them in its own errors, display errors, and form errors
   * instead.
   */
  hoist?: boolean

  /**
   * Resolved value of the `hoist` prop indicating whether this element's errors
   * are pushed to its nearest ancestor element.
   */
  hoisted?: boolean

  /**
   * The element's own errors including all languages (messageBag + validation).
   */
  ownErrors: string[]

  /**
   * The list of current visible error messages for the element, scoped to the
   * active language and limited by `maxErrors`.
   */
  errors: string[]

  /**
   * Error messages propagated to the form, keyed by element path.
   */
  formErrors: Record<string, string[]>

  /**
   * Custom validation messages keyed by rule name.
   */
  ruleMessages?: Record<string, any>

  /**
   * The element's resolved props, including optional debounce, bail, and
   * valueFormat settings.
   */
  props?: Record<string, any> & {
    /**
     * Debounce delay in milliseconds for input validation.
     */
    debounce?: number

    /**
     * Whether to stop validation after the first failing rule.
     */
    bail?: boolean

    /**
     * The format string used for value serialization (e.g. date format).
     */
    valueFormat?: string
  }

  /**
   * The value format string, used when the element serializes values (e.g.
   * dates).
   */
  valueFormat?: string

  /**
   * Loads a value programmatically and untracks expression tracking on this
   * element and all children that have `untrackOn` including `'load'`.
   *
   * @param data The value to load.
   */
  load?: (data: any) => void

  /**
   * Determines whether the given value should be considered non-empty.
   *
   * @param value The value to check.
   */
  filled: (value: any) => boolean

  /**
   * Updates the element's value programmatically.
   *
   * @param data The new value to set.
   */
  update: (data: any) => void

  /**
   * Resets the element to its default value and clears validation state.
   */
  reset: () => void

  /**
   * Clears the element's value to an empty state.
   */
  clear: () => void

  /**
   * Runs validation rules on the element and returns the result.
   */
  validate: () => Promise<any>

  /**
   * Removes all validation state from the element.
   */
  unvalidate: () => void

  /**
   * Marks the element as untouched and pristine.
   */
  clean: () => void

  /**
   * Verifies the element's value against async server-side checks.
   */
  verify?: () => Promise<boolean>
}
```
