````ts
/**
 * Starts a factory chain that merges composables via `.use(…)` and returns the
 * API with `.build()`.
 *
 * Each `.use()` receives the accumulated results of all previous steps (plus
 * `initial` when provided) as `deps`, so factories can declare
 * props/deps/events requirements and prop-dependent returns (e.g.
 * `MakeItemsReturn<P>`) stay intact.
 *
 * @example
 *   ;```ts
 *   return useFeatures(props, events)
 *     .use(makeElement())
 *     .use(makeLayout())
 *     .use(makeData())
 *     .build()
 *   ```
 *
 * @param props The component's props to pass to each composable.
 * @param events The component's events to pass to each composable.
 */
function useFeatures<P, E>(props: P, events: E): FeatureBuilder<P, E>

/**
 * Starts a factory chain seeded with `initial` deps. Seed members are passed to
 * the first `.use()` as `deps` and are included in `.build()`'s return type at
 * the top level (not through `type`-narrowing).
 *
 * @example
 *   ;```ts
 *   return useFeatures(props, events, { nullValue, multiple: true })
 *     .use(makeElement())
 *     .use(makeData())
 *     .use(makeItems({ multiple: true }))
 *     .build()
 *   ```
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
````
