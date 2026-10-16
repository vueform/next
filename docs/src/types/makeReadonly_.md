```ts
/**
 * Provides readonly state management for form elements.
 *
 * @param options Factory options containing element props and resolved
 *   dependencies.
 */
const makeReadonly: (
  config?: unknown
) => (options: MakeReadonlyOptions) => { readonly: ComputedRef<boolean> }
```
