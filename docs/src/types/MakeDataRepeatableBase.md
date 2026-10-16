```ts
/**
 * `MakeDataBase` counterpart for repeatable elements (keeps list keys, drops
 * translatable keys).
 */
type MakeDataRepeatableBase = Omit<
  UseDataReturn,
  UseDataTranslatableKeys | keyof MakeDataModelApi
> &
  Required<Pick<UseDataReturn, UseDataRepeatableKeys>>
```
