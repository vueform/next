```ts
/**
 * Data factory for translatable elements.
 */
function makeTData(): <
  P extends MakeDataOptions<{ translatable: true }>['props'],
>(
  options: FeatureContext<
    P,
    MakeDataOptions<{ translatable: true }>['deps'],
    MakeDataOptions<{ translatable: true }>['events']
  >
) => MakeDataReturnTranslatable<P>
```
