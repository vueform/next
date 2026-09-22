```ts
/**
 * Pairs a factory with keys to pick from its return type for `ReturnsOf`
 * aggregation.
 */
type Pair<Fn extends (...args: any) => any, Keys extends PropertyKey[]> = [
  Fn,
  Keys,
]
```
