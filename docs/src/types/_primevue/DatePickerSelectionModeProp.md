```ts
/**
 * Bound for the `TSelectionMode` generic of date-picker elements: one of
 * PrimeVue's date selection modes, or `undefined` when unset.
 *
 * Intentionally limited to the literal modes so a component instance's props
 * stay assignable to the component's canonical (defaulted) context.
 */
type DatePickerSelectionModeProp = 'single' | 'multiple' | 'range' | undefined
```
