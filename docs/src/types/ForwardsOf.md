```ts
/**
 * Adds `ForwardsApi` to the api type when the blueprint carries a
 * `makeForwards` declaration.
 */
type ForwardsOf<TApi> = TApi extends { forwards: ForwardsConfig }
  ? ForwardsApi
  : {}
```
