```ts
/**
 * Conditions produced by a function (`colConditions`, `itemConditions`, …).
 * Function returns get no contextual typing through `defineSchema`'s generic
 * inference, so structured array literals arrive widened (`string[][]`, not
 * tuple arrays) — the widened shape is accepted and the runtime validates
 * structure, as it already does. Declarative conditions props stay on the
 * strict `ConditionalProp`.
 */
type ConditionsResult<TContext = any> =
  ConditionalProp<TContext> | readonly (readonly unknown[])[]
```
