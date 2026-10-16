```ts
/**
 * Union of the `type` prop literals registered in a family registry (derived
 * from each entry's wide props).
 */
type TypesOfRegistry<R> = {
  [K in keyof R]: R[K] extends { props: infer P }
    ? P extends { type?: infer T }
      ? Extract<T, string>
      : never
    : never
}[keyof R]
```
