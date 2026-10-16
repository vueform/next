```ts
/**
 * Props for the addon component blueprint.
 */
interface AddonProps<
  S = AddonSlots,
  P = AddonParts,
  C = AddonClasses,
  TContext = any,
> extends BaseComponentProps<S, P, C, TContext> {
  /**
   * The addon content — a text value or an element schema tuple.
   */
  addon?: AddonItem
}
```
