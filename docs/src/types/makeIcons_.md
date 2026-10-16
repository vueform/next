```ts
/**
 * Resolves before/after icon props into CSS class strings using the
 * config-level icon resolver.
 *
 * @param options Factory options containing the element's icon props.
 */
const makeIcons: (
  config?: unknown
) => (options: MakeIconsOptions) => {
  iconBefore: ComputedRef<string | undefined>
  iconAfter: ComputedRef<string | undefined>
}
```
