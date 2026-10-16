```ts
/**
 * A normalized item with resolved value, label, and disabled state. Items
 * originating from an array of objects also include `$raw` with the original.
 */
type ResolvedItem<TValue = any, TRaw = Record<string, any>> = {
  /**
   * The resolved option value.
   */
  value: TValue

  /**
   * The resolved display label.
   */
  label: string

  /**
   * Whether the option is currently disabled.
   */
  disabled: boolean

  /**
   * Stable index key for the option within the flat item list.
   */
  key: number

  /**
   * The original raw item object before normalization.
   */
  $raw?: TRaw
}
```
