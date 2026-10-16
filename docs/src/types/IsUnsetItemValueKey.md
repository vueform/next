```ts
/**
 * Whether `TItemValueKey` is unset: either explicitly `undefined`, or still a
 * whole-constraint union (`string | undefined` / all item keys) left by an
 * uninferred Vue generic with no default.
 */
type IsUnsetItemValueKey<TItem, TItemValueKey> = [TItemValueKey] extends [
  undefined,
]
  ? true
  : [ItemKeyOf<TItem> | undefined] extends [TItemValueKey]
    ? true
    : false
```
