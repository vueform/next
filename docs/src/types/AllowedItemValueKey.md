```ts
/**
 * Allowed string keys for `itemValue` on the resolved item shape.
 *
 * Functions are intentionally excluded — they are typed via a separate
 * `TItemValueReturn` generic so the `item` parameter stays concrete (and
 * contextually typed) in inline arrows.
 */
type AllowedItemValueKey<TItems, TGroupChildren = undefined> = ItemKeyOf<
  RawItemOf<TItems, TGroupChildren>
>
```
