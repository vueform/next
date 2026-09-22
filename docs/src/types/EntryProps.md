```ts
/**
 * VfCheckbox props narrowed from a registry `TEntry` payload, applying the
 * entry's `trueValue` / `falseValue` props as generics.
 */
type EntryProps<TEntry> = VfCheckboxProps<
  EntryPropOr<TEntry, 'trueValue', true>,
  EntryPropOr<TEntry, 'falseValue', false>
>
```
