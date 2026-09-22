```ts
/**
 * The effective raw item type resolved from `items` (and optional
 * `groupChildren`). Handles arrays, object maps, endpoint URLs, and function
 * sources.
 */
type RawItemOf<TItems, TGroupChildren = undefined> =
  IsDefaultItems<TItems> extends true
    ? any
    : FlatItemsData<TItems, TGroupChildren> extends infer D
      ? D extends string
        ? unknown
        : D extends readonly (infer E)[]
          ? E
          : IsPlainRecord<D> extends true
            ? {
                value: Extract<keyof D, string | number>
                label: D[Extract<keyof D, string | number>]
              }
            : unknown
      : unknown
```
