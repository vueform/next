```ts
/**
 * Configuration for the element factory providing core lifecycle, state, and
 * composition for a form element.
 */
type MakeElementOptions<Type extends string = string> = {
  props: {
    type: Type | undefined
    name: ElementName
    template: ComponentProp | undefined | null
    conditions: ConditionalProp | undefined
    conditionsTrigger: ConditionsTriggerProp | undefined
    conditionsDebounce: number | undefined
    id: TProp | undefined
    detached: boolean | undefined
    slots: Record<string, any> | undefined
  }
}
```
