```ts
/**
 * Registry entry for VfGrid. `TEntry` narrows `modelValue` from the entry's
 * `grid` schema so `defineSchema` constrains grid models to their named cell
 * elements (nested and non-nested alike) and types `find()`'s returned `model`
 * the same way.
 */
interface VfGridEntry<TEntry = Record<string, any>> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfGridEmits,
  VfGridSlots,
  VfGridParts,
  VfGridClasses,
  VfGridContext<EntryProps<TEntry>>
> {}
```
