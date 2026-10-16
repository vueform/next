```ts
/**
 * Maps part names to their prop types using the `part:<name>` key convention.
 */
type PartProps<T extends Record<string, any>, TContext = any> = {
  [K in keyof T & string as `part:${K}`]?: PartValue<T[K], TContext>
}
```
