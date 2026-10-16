```ts
/**
 * Registry entry for VfMultiSelect. `TEntry` narrows the props / emits /
 * context by the entry's option-driving props, the same way SFC generics do.
 */
interface VfMultiSelectEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfMultiSelectEmits<
    EntryOptionsOf<TEntry>,
    EntryOptionValueKeyOf<TEntry>,
    EntryOptionGroupChildrenOf<TEntry>,
    any,
    EntryOptionValueReturnOf<TEntry>
  >,
  VfMultiSelectSlots,
  VfMultiSelectParts,
  VfMultiSelectClasses,
  VfMultiSelectContext<EntryProps<TEntry>>
> {}
```
