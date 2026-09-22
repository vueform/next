```ts
/**
 * Model / default prop type for date-picker — `NoInfer` so `modelValue` does
 * not compete with `selectionMode` when inferring generics.
 */
type DatePickerModelProp<
  TSelectionMode extends DatePickerSelectionModeProp =
    DatePickerSelectionModeProp,
> = NoInfer<DatePickerModelOf<TSelectionMode>>
```
