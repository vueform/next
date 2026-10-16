```ts
/**
 * String keys available on an item object for `itemValue` / `itemLabel` / etc.
 * Falls back to `string` for non-object items.
 */
type ItemKeyOf<TItem> = [TItem] extends [Record<string, any>]
  ? Extract<keyof TItem, string>
  : string
```
