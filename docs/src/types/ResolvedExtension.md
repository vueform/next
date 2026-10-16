```ts
/**
 * Normalizes an extension return: `void` / non-objects become `{}` so
 * `SpreadMerge` does not collapse the API when the callback only runs hooks.
 */
type ResolvedExtension<T> = T extends Record<string, any> ? T : {}
```
