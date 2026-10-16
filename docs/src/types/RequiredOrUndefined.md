```ts
/**
 * Makes all properties required while preserving `undefined` in the type of
 * originally optional properties.
 */
type RequiredOrUndefined<T> = T extends object
  ? Prettify<RequirePropsButKeepUndefined<T>>
  : T
```
