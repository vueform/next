```ts
/**
 * Allowed type for group key props given an items shape. Resolves to `never`
 * for plain scalar arrays and plain object/record maps.
 */
type GroupKeyProp<TItems, TReturn> =
  AllowsItemKeyProps<TItems> extends true
    ? [GroupOf<TItems>] extends [never]
      ? string | ((group: any) => TReturn)
      : | Extract<keyof GroupOf<TItems>, string>
        | ((group: GroupOf<TItems>) => TReturn)
    : never
```
