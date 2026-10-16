```ts
/**
 * Resolves the text label.
 *
 * @param options Factory options containing element props.
 */
const makeText: (
  config?: unknown
) => (options: MakeTextOptions) => {
  text: ComputedRef<string | (string & {}) | undefined>
}
```
