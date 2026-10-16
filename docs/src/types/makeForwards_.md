```ts
/**
 * Declares the events and slots an adapter component forwards to the underlying
 * third-party component. The factory only places the config on the api as
 * `forwards`; `useBlueprint` notices it and builds the actual `forwardProps` /
 * `forwardSlots` computeds, declared on its returned `api` type (see
 * `ForwardsApi`).
 *
 * @param config The event and slot names to forward.
 */
const makeForwards: (
  config?: ForwardsConfig | undefined
) => (options: Record<string, any>) => { forwards: ForwardsConfig }
```
