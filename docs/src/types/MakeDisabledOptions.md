```ts
/**
 * Configuration for the disable factory controlling whether the element is
 * disabled.
 */
type MakeDisabledOptions = {
  props: {
    disabled: ConditionalProp | undefined
    conditionsTrigger?: ConditionsTriggerProp
    conditionsDebounce?: number
  }
  deps: ReturnsOf<[[typeof makeElement, ['path']]]>
}
```
