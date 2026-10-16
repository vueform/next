```ts
/**
 * Registry entry for VfSelectButton. `TEntry` narrows the props / emits /
 * context by the entry's option-driving props, the same way SFC generics do.
 */
interface VfSelectButtonEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfSelectButtonEmits<
    EntryOptionsOf<TEntry>,
    EntryOptionValueKeyOf<TEntry>,
    EntryMultipleOf<TEntry>,
    any,
    EntryOptionValueReturnOf<TEntry>
  >,
  VfSelectButtonSlots,
  VfSelectButtonParts,
  VfSelectButtonClasses,
  VfSelectButtonContext<EntryProps<TEntry>>
> {}
```
