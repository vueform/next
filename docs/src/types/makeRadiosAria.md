```ts
/**
 * Provides computed ARIA attributes for a radio group container.
 *
 * @param options Factory options containing dependencies from earlier
 *   factories.
 */
const makeRadiosAria: (
  config?: unknown
) => (options: MakeRadiosAriaOptions) => {
  radioAria: ComputedRef<{
    'aria-invalid': boolean
    'aria-required': boolean
    'aria-describedby': string | undefined
  }>
}
```
