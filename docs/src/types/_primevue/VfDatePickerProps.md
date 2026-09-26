```ts
/**
 * Generic props interface for the VfDatePicker component, parameterized by the
 * model-driving type argument (e.g. `VfDatePickerProps<'multiple'>`). Reach for
 * `VfDatePickerProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
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
