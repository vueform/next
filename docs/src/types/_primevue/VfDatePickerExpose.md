```ts
/**
 * Augmentable public API surface for VfDatePicker.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `DatePickerExpose` for all date-picker-based components)
 * so they appear on `ContextOf<'VfDatePicker'>` / `context$` / `defineExpose`.
 */
interface VfDatePickerExpose extends DatePickerExpose {}
```
