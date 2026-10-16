```ts
/**
 * One composable step in a `useFeatures` chain.
 */
type FeatureSlot<P, E, D, R> = (o: {
  props: P
  events: NoInfer<E>
  deps: D
}) => R
```
