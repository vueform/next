```ts
/**
 * Provides disabled state management with programmatic enable/disable methods.
 *
 * @param options Factory options containing element props and resolved
 *   dependencies.
 */
const makeDisabled: (
  config?: unknown
) => (options: MakeDisabledOptions) => {
  disabled: ComputedRef<boolean>
  disable: () => void
  enable: () => void
}
```
