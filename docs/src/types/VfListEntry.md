```ts
/**
 * Registry entry for VfList. `TEntry` narrows `modelValue` from the entry's
 * `schema` + `flat` props so `defineSchema` constrains list models (and
 * `default`s) to their row shape and types `find()`'s returned `model` the same
 * way.
 */
interface VfListEntry<TEntry = Record<string, any>> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfListEmits,
  VfListSlots,
  VfListParts,
  VfListClasses,
  VfListContext<EntryProps<TEntry>>
> {}
```
