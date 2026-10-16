```ts
/**
 * Inputs for the element validation view-model. Everything is passed as live
 * bindings (refs / getters) so the view-model tracks the element's state
 * without owning it.
 */
type MakeElementValidationOptions = {
  /**
   * The parent form context, if any.
   */
  form$?: any

  /**
   * Whether the element is the form root (validates the validation schema
   * instead of own rules).
   */
  isRoot: boolean

  /**
   * The root model store, when the element is the form root (validator adoption
   * / attachment).
   */
  store?: object

  /**
   * The element's own rules (`undefined` for the root).
   */
  rules: Ref<TRulesProp | undefined>

  /**
   * The element's current path.
   */
  path: Ref<string>

  /**
   * The element's current data path — where its value lives in the model. Store
   * write notifications match owners by it; defaults to `path`.
   */
  dataPath?: Ref<string>

  /**
   * The element's raw model (full locale object for translatable elements).
   */
  model: Ref<any>

  /**
   * The element's current-language value (validated by `validateCurrent`).
   */
  value: Ref<any>

  /**
   * Available languages keyed by code.
   */
  languages: Ref<Record<string, any>>

  /**
   * Whether the element is translatable.
   */
  translatable: Ref<boolean>

  /**
   * The active language.
   */
  language: Ref<string>

  /**
   * Whether the element has been touched (blurred at least once).
   */
  touched?: Ref<boolean | undefined>

  /**
   * Whether the element is currently available.
   */
  available: Ref<boolean>

  /**
   * Whether the element is a data container (containers with own rules watch
   * their model deeply).
   */
  isContainer: Ref<boolean>

  /**
   * The resolved `validateOn` triggers (element prop with form fallback).
   */
  validateOn: Ref<string[] | undefined>

  /**
   * The element's component context (`context$`), used as the owner's `el$`.
   */
  el$: () => StatefulElement

  /**
   * Whether the element (including children) is invalid — the live-validation
   * policy keeps validating invalid elements so errors clear as they are fixed.
   * Lazy because the aggregate is derived from this view-model.
   */
  invalid: () => boolean

  /**
   * Validates the element including children — what a user-input intent
   * triggers. Lazy for the same reason.
   */
  validate: () => Promise<boolean> | boolean
}
```
