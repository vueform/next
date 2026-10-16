```ts
/**
 * Builds an event `context$` type from a blueprint factory: the factory's
 * return type (refs unwrapped) with the keys of `TGenerics` (model / items
 * fields) replaced by the component's generic-aware versions.
 *
 * Per-blueprint contexts must wrap this in an `interface` (e.g. `SelectContext
 * extends Context<typeof useBlueprint, …>`) so the blueprint type is resolved
 * lazily and does not cycle through the component registry.
 */
type Context<TBlueprint extends (...args: any[]) => any, TGenerics> = Omit<
  UnwrapApiRefs<ReturnType<TBlueprint>>,
  keyof TGenerics
> &
  TGenerics
```
