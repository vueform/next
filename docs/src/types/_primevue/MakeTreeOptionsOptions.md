```ts
/**
 * Options for the makeTreeOptions factory.
 */
interface MakeTreeOptionsOptions {
  props: {
    options: MaybeRef<TreeOptionsProp> | undefined
    optionsTrigger?: ConditionsTriggerProp
    optionsDebounce?: number
    conditionsTrigger?: ConditionsTriggerProp
    conditionsDebounce?: number
    /**
     * Transforms data received from an endpoint into the tree options format.
     *
     * @param data The data received from the endpoint.
     */
    transformOptions?: (data: any) => any[]
    headers?: Record<string, string>
    method?: string
    loading?: ConditionalProp
  }
  deps: ReturnsOf<
    [
      [typeof makeData, ['nullValue', 'update', 'model', 'pending']],
      [typeof makeElement, ['path']],
      [typeof makeInput, ['input']],
    ]
  >
}
```
