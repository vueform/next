```ts
/**
 * The selected value type derived from `items` and an optional `itemValue` key
 * / mapper return.
 *
 * - Record map → the key type.
 * - Object array with `itemValue` unset → the whole item object (matches runtime
 *   when `itemValue` is omitted).
 * - Object array with a string `itemValue` → `item[itemValue]`.
 * - Object array with a mapper `itemValue` → the mapper's return type.
 * - Scalar array → the scalar type.
 */
type ItemValueOf<
  TItems,
  TItemValueKey = undefined,
  TGroupChildren = undefined,
  TItemValueReturn = unknown,
> =
  IsDefaultItems<TItems> extends true
    ? any
    : UnwrappedItems<TItems> extends string
      ? any
      : IsPlainRecord<UnwrappedItems<TItems>> extends true
        ? Extract<keyof UnwrappedItems<TItems>, string | number>
        : RawItemOf<TItems, TGroupChildren> extends infer Item
          ? Item extends Record<string, any>
            ? ResolveItemValue<Item, TItemValueKey, TItemValueReturn>
            : Item
          : any
```
