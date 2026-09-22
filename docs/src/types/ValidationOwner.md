```ts
/**
 * Live bindings the validator reads from an owner. Paths and values are
 * functions so list reorders don't require re-registration.
 */
type ValidationOwner = {
  /**
   * Stable identity. Units are keyed by this, not by path, so validation state
   * survives list reorders.
   */
  id: object

  /**
   * The element (or virtual element) the check context is built from.
   */
  el$: StatefulElement

  /**
   * Current element path (`''` for the form / model root).
   */
  path: () => string

  /**
   * Current data path — where the owner's value lives in the model. Falls back
   * to `path()` when absent. Store write notifications match owners by this, so
   * it matters where the two diverge (flat containers).
   */
  dataPath?: () => string

  /**
   * Language keys to compile (`['default']` when not translatable).
   */
  languages: () => string[]

  /**
   * The value to validate for a language.
   */
  getValue: (language?: string) => any

  /**
   * Whether to stop after the first failing unit.
   */
  bail?: () => boolean

  /**
   * Element-level debounce fallback.
   */
  debounce?: () => number

  /**
   * Whether the owner has been touched (blur). Used to gate dependent
   * revalidation.
   */
  touched?: () => boolean

  /**
   * Whether the owner is currently available. Unavailable owners are skipped
   * during whole-form / headless sweeps.
   */
  available?: () => boolean
}
```
