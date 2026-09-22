```ts
type DomAttrsOf<T extends keyof IntrinsicElementAttributes> =
  IntrinsicElementAttributes[T] & Record<string, string>
```
