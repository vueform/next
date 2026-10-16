```ts
/**
 * Registry entry for VfCheckboxes. `TEntry` narrows the props / emits / context
 * by the entry's item-driving props, the same way SFC generics do.
 */
interface VfCheckboxesEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfCheckboxesEmits<
    EntryItemsOf<TEntry>,
    EntryItemValueKeyOf<TEntry>,
    EntryGroupChildrenOf<TEntry>,
    any,
    EntryItemValueReturnOf<TEntry>
  >,
  VfCheckboxesSlots,
  VfCheckboxesParts,
  VfCheckboxesClasses,
  VfCheckboxesContext<EntryProps<TEntry>>
> {}
```
