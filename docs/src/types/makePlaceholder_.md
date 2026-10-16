```ts
/**
 * Resolves the placeholder text for input elements.
 *
 * @param options Factory options containing element props.
 */
const makePlaceholder: (
  config?: unknown
) => (options: MakePlaceholderOptions) => {
  placeholder: ComputedRef<string | (string & {}) | undefined>
}
```
