```ts
/**
 * Configuration for the button factory providing click handling, loading state,
 * text props, messaging, and theme tokens.
 */
type MakeButtonOptions = {
  props: {
    icon: TProp | undefined
    text: TProp | undefined
    href: TProp | undefined
    to: TProp | undefined
    severity: TProp | undefined
    loading: ConditionalProp | undefined
    conditionsTrigger: ConditionsTriggerProp | undefined
    conditionsDebounce: number | undefined
    action: string | undefined
    tokens: ThemeTokens | undefined
  }

  events: FeatureEvents<{
    click: [event: MouseEvent, context$: LooseContext]
  }>

  deps: ReturnsOf<
    [[typeof makeElement, ['path']], [typeof makeDisabled, ['disabled']]]
  >
}
```
