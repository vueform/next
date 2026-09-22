```ts
/**
 * Registry entry for VfTabs. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfTabs has no prop-driven generics.
 */
interface VfTabsEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfTabsProps,
  VfTabsEmits,
  VfTabsSlots,
  VfTabsParts,
  VfTabsClasses,
  VfTabsContext
> {}
```
