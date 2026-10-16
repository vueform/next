```ts
/**
 * Allowed type for item key props (`itemLabel`, `itemDisabled`, etc.) given an
 * item shape. String keys are only applicable to object items; function mappers
 * stay allowed for plain scalar arrays and record maps, where they receive the
 * synthetic `{ value, label }` item.
 */
type ItemKeyProp<TItems, TGroupChildren, TReturn> =
  AllowsItemKeyProps<TItems> extends true
    ?
        | ItemKeyOf<RawItemOf<TItems, TGroupChildren>>
        | ((item: RawItemOf<TItems, TGroupChildren>) => TReturn)
    : (item: RawItemOf<TItems, TGroupChildren>) => TReturn
```
