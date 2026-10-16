```ts
/**
 * Provides loading state that combines the element's pending state with an
 * explicit loading prop. The prop is evaluated through the conditions pipeline,
 * so sync and async conditional values are supported uniformly.
 *
 * @param options Factory options containing element props and resolved
 *   dependencies.
 */
const makeLoading: (
  config?: unknown
) => (options: MakeLoadingOptions) => { loading: ComputedRef<boolean> }
```
