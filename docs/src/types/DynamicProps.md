```ts
/**
 * Converts selected keys of a record type into `DProp` variants. Keys listed in
 * `K` become `DProp<T[K]>`, all others are excluded.
 */
type DynamicProps<T, K extends keyof T, TContext = any> = {
  [P in K]?: DProp<T[P], TContext>
}
```
