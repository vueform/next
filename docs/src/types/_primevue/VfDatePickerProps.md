```ts
/**
 * Generic props interface for the VfDatePicker component, parameterized by the
 * model-driving type argument (e.g. `VfDatePickerProps<'multiple'>`). Reach for
 * `VfDatePickerProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
interface VfDatePickerProps<
  TSelectionMode extends DatePickerSelectionModeProp =
    DatePickerSelectionModeProp,
> extends DatePickerProps<
  'date-picker',
  TSelectionMode,
  VfDatePickerSlots<TSelectionMode>,
  VfDatePickerParts,
  VfDatePickerClasses,
  VfDatePickerContext<VfDatePickerProps<TSelectionMode>>
> {}
```
