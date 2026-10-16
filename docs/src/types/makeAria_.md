```ts
/**
 * Provides default computed ARIA attributes for elements that rely on generic
 * layout features (help, description, error regions) and have no
 * element-specific ARIA needs.
 *
 * @param options Factory options containing element props and dependencies.
 */
const makeAria: (
  config?: unknown
) => (options: MakeAriaOptions) => {
  aria: ComputedRef<{
    'aria-labelledby'?: string
    'aria-describedby': string
    'aria-required': boolean
    'aria-invalid': boolean
    'aria-busy': boolean
  }>
}
```
