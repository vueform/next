```ts
/**
 * Normalizes an extension return: `void` / non-objects become `{}`.
 */
type ResolvedExtension<T> = T extends Record<string, any> ? T : {}
```
