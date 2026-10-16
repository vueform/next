```ts
/**
 * Resolves the checkbox input name from the checkboxName prop or container
 * path.
 *
 * @param options Factory options containing element props and dependencies.
 */
const makeCheckboxName: (
  config?: unknown
) => (options: MakeCheckboxNameOptions) => { inputName: ComputedRef<string> }
```
