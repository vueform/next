```ts
/**
 * Registry entry for VfRadioButtonGroup. `TEntry` narrows the props / emits /
 * context by the entry's option-driving props, the same way SFC generics do.
 */
interface VfRadioButtonGroupEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfRadioButtonGroupEmits<
    EntryOptionsOf<TEntry>,
    EntryOptionValueKeyOf<TEntry>,
    EntryOptionGroupChildrenOf<TEntry>,
    any,
    EntryOptionValueReturnOf<TEntry>
  >,
  VfRadioButtonGroupSlots,
  VfRadioButtonGroupParts,
  VfRadioButtonGroupClasses,
  VfRadioButtonGroupContext<EntryProps<TEntry>>
> {}
```
