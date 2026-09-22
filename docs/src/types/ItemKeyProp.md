```ts
/**
 * Allowed type for item key props (`itemLabel`, `itemDisabled`, etc.) given an
 * item shape. Resolves to `never` when key props are not applicable.
 */
type ItemKeyProp<TItems, TGroupChildren, TReturn> =
  AllowsItemKeyProps<TItems> extends true
    ? | ItemKeyOf<RawItemOf<TItems, TGroupChildren>>
      | ((item: RawItemOf<TItems, TGroupChildren>) => TReturn)
    : never
```
