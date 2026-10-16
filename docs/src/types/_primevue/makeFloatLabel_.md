```ts
/**
 * Resolves the floating label text for input elements.
 *
 * @param options Factory options containing element props.
 */
const makeFloatLabel: (
  config?: unknown
) => (options: MakeFloatLabelOptions) => {
  floatLabel: ComputedRef<string | (string & {}) | undefined>
}
```
