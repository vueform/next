```ts
/**
 * One composable step in a `useFeatures` chain.
 *
 * Props are checked as `P` directly (blueprints pass `LooseRequired<TProps>` /
 * `useProps` output, so required-key factory constraints like `template: T |
 * undefined` still apply).
 *
 * `NoInfer` on events keeps that position from poisoning inference of `P`.
 *
 * Factories that do not use props/deps in their return type should declare
 * concrete `MakeXOptions` (not unused `P`/`D` generics). Only prop-dependent
 * returns (e.g. `MakeItemsReturn<P>`) need a generic `P`.
 */
type FeatureSlot<P, E, D, R> = (o: {
  props: P
  events: NoInfer<E>
  deps: D
}) => R
```
