```ts
/**
 * Adds `ForwardsApi` to the api type when the blueprint carries a
 * `makeForwards` declaration — the type-level counterpart of `useBlueprint`
 * noticing `api.forwards` and assigning the built computeds.
 */
type ForwardsOf<TApi> = TApi extends { forwards: ForwardsConfig }
  ? ForwardsApi
  : {}
```
