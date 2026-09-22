```ts
/**
 * Registry entry for VfForm. `TEntry` narrows the schema API slice of the
 * context by the entry's `schema` prop, the same way the SFC generic does.
 */
interface VfFormEntry<TEntry = Record<string, any>> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfFormEmits<EntrySchemaOf<TEntry>>,
  VfFormSlots,
  VfFormParts,
  VfFormClasses,
  VfFormContext<EntryProps<TEntry>>
> {}
```
