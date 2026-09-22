```ts
/**
 * Registry entry for VfGroup. `TEntry` narrows `modelValue` from the entry's
 * `schema` prop so `defineSchema` constrains group models to their child schema
 * shape (nested and non-nested alike) and types `find()`'s returned `model` the
 * same way.
 */
interface VfGroupEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfGroupEmits,
  VfGroupSlots,
  VfGroupParts,
  VfGroupClasses,
  VfGroupContext<EntryProps<TEntry>>
> {}
```
