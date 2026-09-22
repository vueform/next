```ts
/**
 * Registry entry for VfCheckboxGroup. `TEntry` narrows the props / emits /
 * context by the entry's option-driving props, the same way SFC generics do.
 */
interface VfCheckboxGroupEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfCheckboxGroupEmits<
    EntryOptionsOf<TEntry>,
    EntryOptionValueKeyOf<TEntry>,
    EntryOptionGroupChildrenOf<TEntry>,
    any,
    EntryOptionValueReturnOf<TEntry>
  >,
  VfCheckboxGroupSlots,
  VfCheckboxGroupParts,
  VfCheckboxGroupClasses,
  VfCheckboxGroupContext<EntryProps<TEntry>>
> {}
```
