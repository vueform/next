```ts
/**
 * Resolves the IFTA label text for input elements.
 *
 * @param options Factory options containing element props.
 */
const makeIfta: (
  config?: unknown
) => (options: MakeIftaOptions) => {
  ifta: ComputedRef<string | (string & {}) | undefined>
}
```
