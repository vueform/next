```ts
/**
 * Readonly map from selected slot prop names to their types for the given
 * component and slot.
 */
type PropOptions<
  C extends keyof SlotProps,
  S extends keyof SlotProps[C],
  P extends (keyof SlotProps[C][S])[],
> = Readonly<{ [K in P[number]]: SlotProps[C][S][K] }>
```
