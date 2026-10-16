```ts
/**
 * Resolves a conditional prop into a boolean ref evaluated against the current
 * form's model. Setup-only: throws when called outside a component setup
 * context.
 *
 * @param conditions The raw conditional value (or a ref/getter to it).
 * @param options Path, debounce, trigger, date format, model, and context
 *   overrides.
 */
function useConditions(
  conditions: MaybeRef<ConditionalProp | undefined>,
  options: UseConditionsOptions = {}
): Ref<boolean>
```
