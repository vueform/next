```ts
/**
 * Options for the `useConditions` / `useConditionalList` composables.
 */
interface UseConditionsOptions {
  /**
   * The element's path used for wildcard resolution in structured conditions.
   */
  path?: MaybeRef<string>

  /**
   * The debounce delay in milliseconds applied before re-evaluating async
   * conditions when the trigger source changes. Overrides the global
   * `$conditions.debounce` config (default `300`).
   */
  debounce?: MaybeRef<number | undefined>

  /**
   * The source that triggers re-evaluation of async conditions. When omitted,
   * any change in the model re-triggers evaluation.
   */
  trigger?: MaybeRef<ConditionsTriggerProp | undefined>

  /**
   * The date format used when comparing the target value in date-based
   * structured conditions.
   */
  valueFormat?: MaybeRef<string | undefined>

  /**
   * The model conditions are checked against. Defaults to the current form's
   * model (`useFormContext().model`).
   */
  model?: MaybeRef<Record<string, any> | undefined>

  /**
   * The component context passed to function conditions. Defaults to the
   * current component's context (`useComponentContext()`).
   */
  context$?: any
}
```
