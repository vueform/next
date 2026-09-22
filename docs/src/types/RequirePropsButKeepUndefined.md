```ts
/**
 * Makes all keys required while preserving undefined in value unions.
 */
type RequirePropsButKeepUndefined<T> = Omit<Required<T>, OptionalKeys<T>> & {
  [K in OptionalKeys<T>]-?: Exclude<T[K], undefined> | undefined
}
```
