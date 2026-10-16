```ts
/**
 * Maps class slot names to their class value types using the `class:<name>` key
 * convention. Functional class keys also accept a plain `ClassValue`.
 */
type ClassProps<T extends Record<string, any>, TContext = any> = {
  [K in keyof T & string as `class:${K}`]?: ClassInput<T[K], TContext>
}
```
