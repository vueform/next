```ts
/**
 * Maps class slot names to their class value types using the `reclass:<name>`
 * key convention. Functional class keys also accept a plain `ClassValue`.
 */
type ReclassProps<T extends Record<string, any>, TContext = any> = {
  [K in keyof T & string as `reclass:${K}`]?: ClassInput<T[K], TContext>
}
```
