```ts
/**
 * Registry entry for VfCascadeSelect. `TEntry` narrows the props / emits /
 * context by the entry's option-driving props, the same way SFC generics do.
 */
interface VfCascadeSelectEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfCascadeSelectEmits<
    EntryOptionsOf<TEntry>,
    EntryOptionValueKeyOf<TEntry>,
    EntryOptionGroupChildrenOf<TEntry, CascadeOptionGroupChildrenProp>,
    any,
    EntryOptionValueReturnOf<TEntry>
  >,
  VfCascadeSelectSlots,
  VfCascadeSelectParts,
  VfCascadeSelectClasses,
  VfCascadeSelectContext<EntryProps<TEntry>>
> {}
```
