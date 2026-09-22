```ts
/**
 * Data factory for repeatable (list) elements.
 */
function makeRData(): <
  P extends MakeDataOptions<{ repeatable: true }>['props'],
>(
  options: FeatureContext<
    P,
    MakeDataOptions<{ repeatable: true }>['deps'],
    MakeDataOptions<{ repeatable: true }>['events']
  >
) => MakeDataReturnRepeatable<P>
```
