```ts
/**
 * Configuration for the loading factory combining explicit loading props with
 * async pending state from inputs.
 */
type MakeLoadingOptions = {
  props: {
    loading?: ConditionalProp
    conditionsTrigger?: ConditionsTriggerProp
    conditionsDebounce?: number
  }
  deps: ReturnsOf<
    [[typeof makeElement, ['path']], [typeof makeData, ['pending']]]
  >
}
```
