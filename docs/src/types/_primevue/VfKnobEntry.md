```ts
/**
 * Registry entry for VfKnob. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfKnob has no prop-driven generics.
 */
interface VfKnobEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfKnobProps,
  VfKnobEmits,
  VfKnobSlots,
  VfKnobParts,
  VfKnobClasses,
  VfKnobContext
> {}
```
