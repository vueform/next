```ts
/**
 * @write
 */
interface MakeInputOptions {
  deps: ReturnsOf<
    [[typeof makeData, ['onUserInput', 'update', 'value']]],
    [[typeof makeInteraction, ['handleFocus', 'handleBlur']]]
  >
  events: FeatureEvents<{
    input: [value: any, e: Event | undefined, context$: LooseContext]
  }>
}
```
