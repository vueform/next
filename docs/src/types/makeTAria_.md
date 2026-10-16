```ts
/**
 * Provides computed ARIA attributes for translatable text inputs, including
 * language-aware describedby and lang.
 *
 * @param options Factory options containing element props and dependencies.
 */
const makeTAria: (
  config?: unknown
) => (options: MakeTAriaOptions) => {
  aria: ComputedRef<{
    'aria-labelledby'?: string
    'aria-describedby': string
    'aria-required': boolean
    'aria-invalid': boolean
    'aria-busy': boolean
    'aria-lang': string | undefined
  }>
}
```
