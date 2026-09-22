```ts
/**
 * The conditions module type providing model-bound condition evaluation.
 */
interface ConditionsModule {
  /**
   * Resolves a single conditional prop into a boolean ref evaluated against the
   * given model.
   *
   * @param conditions The raw conditional value (or a ref/getter to it).
   * @param model The model conditions are checked against.
   * @param context$ The component context passed to function conditions.
   * @param options Path, debounce, trigger, and date format options.
   */
  makeConditional: (
    conditions: MaybeRef<ConditionalProp | undefined>,
    model: MaybeRef<Record<string, any> | undefined>,
    context$: any,
    options?: MakeConditionalOptions
  ) => Ref<boolean>

  /**
   * Resolves conditions for a dynamic list of items into a parallel array of
   * boolean refs, managed inside an effect scope that is rebuilt whenever the
   * source list changes. Items without conditions default to `true`.
   *
   * @param source A ref or getter returning the list of items.
   * @param getConditions Extracts the conditions prop from each item.
   * @param model The model conditions are checked against.
   * @param context$ The component context passed to function conditions.
   * @param options Path, debounce, trigger, and date format options.
   */
  makeConditionalList: <T>(
    source: Ref<T[]>,
    getConditions: (item: T) => ConditionalProp | undefined,
    model: MaybeRef<Record<string, any> | undefined>,
    context$: any,
    options?: MakeConditionalOptions
  ) => Ref<Ref<boolean>[]>
}
```
