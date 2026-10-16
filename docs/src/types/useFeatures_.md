```ts
/**
 * Starts a factory chain that merges composables via `.use(…)` and returns the
 * API with `.build()`. Each `.use()` receives the accumulated results of all
 * previous steps as `deps`.
 *
 * @param props The component's props to pass to each composable.
 * @param events The component's events to pass to each composable.
 */
function useFeatures<P, E>(props: P, events: E): FeatureBuilder<P, E>

/**
 * Starts a factory chain seeded with `initial` deps.
 *
 * @param props The component's props to pass to each composable.
 * @param events The component's events to pass to each composable.
 * @param initial Dependencies used as the starting accumulator value.
 */
function useFeatures<P, E, I extends Record<string, any>>(
  props: P,
  events: E,
  initial: I
): FeatureBuilder<P, E, {}, I>
```
