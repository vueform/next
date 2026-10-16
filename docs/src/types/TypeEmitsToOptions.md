```ts
/**
 * Converts a Vue emit declaration record into a map of event names to their
 * argument tuples.
 */
type TypeEmitsToOptions<T extends Record<string, any>> = {
  [K in keyof T & string]: T[K] extends [...args: infer Args] ? Args : any[]
}
```
