```ts
/**
 * Configuration for the suggestions factory that normalizes AutoComplete
 * suggestions using PrimeVue-style prop names.
 */
type MakeSuggestionsOptions = {
  props: {
    suggestions?: MaybeRef<SuggestionsProp>
    optionLabel?: ItemLabel
    optionDisabled?: ItemDisabled
    optionsTrigger?: ConditionsTriggerProp
    optionsDebounce?: number
    transformOptions?: (data: any) => any[] | Record<string, any>
    headers?: Record<string, string>
    method?: string
    multiple?: boolean
  }
  deps: ReturnsOf<
    [
      [typeof makeData, ['nullValue', 'update', 'model', 'pending']],
      [typeof makeElement, ['path']],
      [typeof makeInput, ['input', 'handleInput']],
    ]
  >
  events: FeatureEvents<{
    complete: [event: AutoCompleteCompleteEvent]
  }>
}
```
