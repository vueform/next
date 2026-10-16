```ts
/**
 * Creates a new context for providing and injecting data.
 *
 * @param key The key of the context to create.
 */
function createContext<T>(
  key: ContextKey<T>
): readonly [
  (key?: ContextKey<T>) => T | undefined,
  (context: T, app?: App) => T,
]
```
