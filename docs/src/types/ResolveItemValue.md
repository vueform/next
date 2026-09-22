```ts
/**
 * Resolves the selected value from an item given a string key and/or a mapper
 * return type.
 *
 * - Mapper return (`TItemValueReturn`) wins when it is not `unknown`.
 * - Otherwise a concrete string key picks `item[key]`.
 * - Otherwise (both unset) the whole item is used.
 * - A function type in the key slot is also accepted for type-level tests:
 *   `ItemValueOf<Items, (item: Item) => R>`.
 */
type ResolveItemValue<TItem, TItemValueKey, TItemValueReturn> =
  TItemValueKey extends (...args: any) => infer R
    ? R
    : unknown extends TItemValueReturn
      ? IsUnsetItemValueKey<TItem, TItemValueKey> extends true
        ? TItem
        : TItemValueKey extends keyof TItem
          ? TItem[TItemValueKey]
          : any
      : TItemValueReturn
```
