```ts
/**
 * Provides computed ARIA attributes for a checkbox input.
 *
 * @param options Factory options containing element props and dependencies.
 */
const makeCheckboxAria: (
  config?: unknown
) => (options: MakeCheckboxAriaOptions) => {
  aria: ComputedRef<{
    'aria-labelledby'?: string
    'aria-describedby': string
    'aria-required': boolean
    'aria-invalid': boolean
    'aria-busy': boolean
  }>
}
```
