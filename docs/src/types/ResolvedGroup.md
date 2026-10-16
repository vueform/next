```ts
/**
 * A resolved group containing a label, its normalized child items, and the
 * original group object as `$raw`.
 */
type ResolvedGroup<TValue = any, TRaw = Record<string, any>> = {
  /**
   * The resolved group label.
   */
  label: string

  /**
   * The group's normalized child items.
   */
  items: ResolvedItem<TValue, TRaw>[]

  /**
   * The original raw group object before normalization.
   */
  $raw: Record<string, any>
}
```
