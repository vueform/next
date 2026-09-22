```ts
/**
 * Configuration for the items factory that normalizes option items.
 */
type MakeItemsOptions = {
  props: {
    /**
     * Optional key (matches `ItemsProps`): may be absent on the props object.
     * When present, the value may still be `undefined`.
     */
    items?: MaybeRef<ItemsProp>
    itemValue?: ItemValue
    itemLabel?: ItemLabel
    itemDisabled?: ItemDisabled
    itemConditions?: ItemConditions
    itemsTrigger?: ConditionsTriggerProp
    itemsDebounce?: number
    conditionsTrigger?: ConditionsTriggerProp
    conditionsDebounce?: number
    headers?: Record<string, string>
    method?: string
    groupLabel?: GroupLabel
    groupChildren?: GroupChildren
    groupConditions?: GroupConditions
    multiple?: boolean
    /**
     * @write
     */
    minLength?: number
    transformItems?: (data: any) => any[] | Record<string, any>
  }
  deps: ReturnsOf<[[typeof makeData, ['nullValue', 'update', 'model']]]>
}
```
