```ts
/**
 * Date-picker model shaped by `selectionMode`:
 *
 * - unset / `'single'` — `string | null`
 * - `'multiple'` / `'range'` — `string[]`
 * - wide union — `TextMaybeArrayModel`
 */
type DatePickerModelOf<
  TSelectionMode extends DatePickerSelectionModeProp =
    DatePickerSelectionModeProp,
> = [DatePickerSelectionModeProp] extends [TSelectionMode]
  ? TextMaybeArrayModel
  : TSelectionMode extends 'multiple' | 'range'
    ? string[]
    : string | null
```
