```ts
/**
 * Resolves dynamic min, max, and step boundaries and clamps the element value
 * when the resolved bounds change.
 *
 * @param options Factory options containing element props and resolved
 *   dependencies.
 */
const makeInterval: (
  config?: unknown
) => (options: MakeIntervalOptions) => {
  min: ComputedRef<number | undefined>
  max: ComputedRef<number | undefined>
  step: ComputedRef<number | undefined>
}
```
