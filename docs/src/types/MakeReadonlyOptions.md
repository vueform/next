```ts
/**
 * Configuration for the readonly factory controlling whether the element is
 * read-only.
 */
type MakeReadonlyOptions = {
  props: {
    readonly: ConditionalProp | undefined
    conditionsTrigger?: ConditionsTriggerProp
    conditionsDebounce?: number
  }
  deps: ReturnsOf<[[typeof makeElement, ['path']]]>
}
```
