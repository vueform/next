```ts
/**
 * Registry entry for VfMatrix. `TEntry` narrows `modelValue` from the entry's
 * `rows` / `cols` / `mode` props so `defineSchema` constrains matrix models
 * (and `default`s) to their row/col shape and types `find()`'s returned `model`
 * the same way.
 */
interface VfMatrixEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfMatrixEmits,
  VfMatrixSlots,
  VfMatrixParts,
  VfMatrixClasses,
  VfMatrixContext<EntryProps<TEntry>>
> {}
```
