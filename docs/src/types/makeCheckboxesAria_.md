```ts
/**
 * Provides computed ARIA attributes for a checkbox group container.
 *
 * @param options Factory options containing dependencies from earlier
 *   factories.
 */
const makeCheckboxesAria: (
  config?: unknown
) => (options: MakeCheckboxesAriaOptions) => {
  checkboxAria: ComputedRef<{
    'aria-invalid': boolean
    'aria-required': boolean
    'aria-describedby': string | undefined
  }>
}
```
