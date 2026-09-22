```ts
/**
 * `MakeDataBase` counterpart for translatable elements (keeps translate keys,
 * drops list keys).
 */
type MakeDataTranslatableBase = Omit<
  UseDataReturn,
  UseDataRepeatableKeys | keyof MakeDataModelApi
> &
  Required<Pick<UseDataReturn, UseDataTranslatableKeys>>
```
