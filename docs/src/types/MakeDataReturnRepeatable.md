```ts
/**
 * Repeatable `makeData` return (keeps list keys, drops translatable keys).
 */
type MakeDataReturnRepeatable<P = MakeDataOptions['props']> =
  MakeDataRepeatableBase & MakeDataModelApi<P>
```
