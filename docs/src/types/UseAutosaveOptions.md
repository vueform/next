```ts
/**
 * Configuration options for the `useAutosave` composable — the form-specific
 * wiring options, with the context-dependent members (`form$`,
 * `resolveEndpoint`) resolved by the composable itself.
 */
type UseAutosaveOptions = Omit<MakeAutosaveOptions, 'form$' | 'resolveEndpoint'>
```
