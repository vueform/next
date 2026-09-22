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
