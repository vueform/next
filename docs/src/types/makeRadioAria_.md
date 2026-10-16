```ts
/**
 * Provides computed ARIA attributes for a radio input.
 *
 * @param options Factory options containing element props and dependencies.
 */
const makeRadioAria: (
  config?: unknown
) => (options: MakeRadioAriaOptions) => {
  aria: ComputedRef<{
    'aria-labelledby'?: string
    'aria-describedby': string
    'aria-required': boolean
    'aria-invalid': boolean
    'aria-busy': boolean
  }>
}
```
