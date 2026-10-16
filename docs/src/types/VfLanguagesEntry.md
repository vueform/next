```ts
/**
 * Registry entry for VfLanguages. `TEntry` is accepted for registry uniformity
 * but does not narrow anything — VfLanguages has no prop-driven generics.
 */
interface VfLanguagesEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfLanguagesProps,
  VfLanguagesEmits,
  VfLanguagesSlots,
  VfLanguagesParts,
  VfLanguagesClasses,
  VfLanguagesContext
> {}
```
