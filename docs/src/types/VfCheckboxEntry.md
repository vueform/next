```ts
/**
 * Registry entry for VfCheckbox. `TEntry` narrows the props / emits / context
 * by the entry's model-driving props, the same way SFC generics do.
 */
interface VfCheckboxEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfCheckboxEmits<
    EntryPropOr<TEntry, 'trueValue', true>,
    EntryPropOr<TEntry, 'falseValue', false>
  >,
  VfCheckboxSlots,
  VfCheckboxParts,
  VfCheckboxClasses,
  VfCheckboxContext<EntryProps<TEntry>>
> {}
```
