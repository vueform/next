```ts
/**
 * Bound for the `TSelectionMode` generic of tree-select elements: one of
 * PrimeVue's tree selection modes, or `undefined` when unset.
 *
 * Intentionally limited to the literal modes so a component instance's props
 * stay assignable to the component's canonical (defaulted) context.
 */
type TreeSelectionModeProp = 'single' | 'multiple' | 'checkbox' | undefined
```
