```ts
/**
 * Registry entry for VfSteps. `TEntry` is accepted for registry uniformity but
 * does not narrow anything — VfSteps has no prop-driven generics.
 */
interface VfStepsEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfStepsProps,
  VfStepsEmits,
  VfStepsSlots,
  VfStepsParts,
  VfStepsClasses,
  VfStepsContext
> {}
```
