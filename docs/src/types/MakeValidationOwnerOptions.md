```ts
/**
 * Live bindings used to assemble a `ValidationOwner`.
 */
type MakeValidationOwnerOptions = {
  /**
   * Stable owner identity (units and views are keyed by it).
   */
  id: object

  /**
   * Current element path getter.
   */
  path: () => string

  /**
   * Current data path getter — where the owner's value lives in the model.
   * Store write notifications match owners by it; defaults to `path`.
   */
  dataPath?: () => string

  /**
   * The element (or virtual element) context getter.
   */
  el$: () => StatefulElement

  /**
   * Whether the source is translatable.
   */
  translatable: () => boolean

  /**
   * Available language keys (only read when translatable).
   */
  languages: () => string[]

  /**
   * The raw value getter (full locale object for translatable sources).
   */
  value: () => any

  /**
   * Whether to stop after the first failing unit of a language.
   */
  bail?: () => boolean

  /**
   * Element-level debounce fallback.
   */
  debounce?: () => number

  /**
   * Whether the owner has been touched (gates dependent revalidation).
   */
  touched?: () => boolean

  /**
   * Whether the owner is currently available.
   */
  available?: () => boolean
}
```
