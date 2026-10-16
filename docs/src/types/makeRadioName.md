```ts
/**
 * Resolves the radio input name from the radioName prop or container path, and
 * deselects other standalone radios in the same group when one is selected.
 *
 * @param options Factory options containing element props and dependencies.
 */
const makeRadioName: (
  config?: unknown
) => (options: MakeRadioNameOptions) => { inputName: ComputedRef<string> }
```
