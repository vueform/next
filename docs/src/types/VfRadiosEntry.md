```ts
/**
 * Registry entry for VfRadios. `TEntry` narrows the props / emits / context by
 * the entry's item-driving props, the same way SFC generics do.
 */
interface VfRadiosEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfRadiosEmits<
    EntryItemsOf<TEntry>,
    EntryItemValueKeyOf<TEntry>,
    EntryGroupChildrenOf<TEntry>,
    any,
    EntryItemValueReturnOf<TEntry>
  >,
  VfRadiosSlots,
  VfRadiosParts,
  VfRadiosClasses,
  VfRadiosContext<EntryProps<TEntry>>
> {}
```
