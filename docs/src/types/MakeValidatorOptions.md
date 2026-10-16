```ts
/**
 * Options for creating a validator (`getValidationModule().makeValidator` /
 * `createValidation(config).makeValidator`).
 */
type MakeValidatorOptions = {
  /**
   * The form data object model units validate.
   */
  model: Ref<unknown>

  /**
   * The parent form context, if any.
   */
  form$?: FormContext

  /**
   * The model store backing the validated model, when there is one. The
   * validator subscribes to its write notifications so every model mutation —
   * element input, `update()` / `load()` at any level, server write-backs —
   * dirties the validation schema and revalidates cross-field dependents,
   * without relying on call sites to notify. Duck-typed to avoid a module
   * dependency on the model package.
   */
  store?: {
    onWrite: (cb: (dataPath: string) => void) => () => void
  }

  /**
   * Looks up an element by path (wildcard resolution, `$` params, model-unit
   * issue bucketing).
   *
   * @param path The element path to look up.
   */
  find: (path: string) => any

  /**
   * How many times the form has been submitted (gates dependent revalidation).
   * A boolean `true` is treated as submitted (headless).
   */
  submits: () => number | boolean
}
```
