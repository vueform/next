```ts
/**
 * Translatable `makeData` return (keeps translate keys, drops list keys).
 */
type MakeDataReturnTranslatable<
  P = MakeDataOptions['props'],
  TValue = any,
> = MakeDataTranslatableBase & MakeDataModelApiTranslatable<P, TValue>
```
