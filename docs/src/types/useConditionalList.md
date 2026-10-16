```ts
/**
 * Resolves conditions for a dynamic list of items into a parallel array of
 * boolean refs evaluated against the current form's model (or a custom one).
 * Items without conditions default to `true`. Setup-only: throws when called
 * outside a component setup context. When the `conditions` module is not
 * registered, returns an empty list.
 *
 * @param source A ref or getter returning the list of items.
 * @param getConditions Extracts the conditions prop from each item.
 * @param options Path, debounce, trigger, date format, model, and context
 *   overrides.
 */
function useConditionalList<T>(
  source: Ref<T[]>,
  getConditions: (item: T) => ConditionsResult | undefined,
  options: UseConditionsOptions = {}
): Ref<Ref<boolean>[]>
```
