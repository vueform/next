```ts
const makeElement: <
  Type extends string = string,
  P extends MakeElementOptions<Type>['props'] = {
    type: Type | undefined
    name: ElementName
    template: ComponentProp | undefined | null
    conditions: ConditionalProp | undefined
    conditionsTrigger: ConditionsTriggerProp | undefined
    conditionsDebounce: number | undefined
    id: TProp | undefined
    detached: boolean | undefined
    slots: Record<string, any> | undefined
  },
>(
  config?: unknown
) => (options: { props: P }) => {
  $el: Readonly<Ref<HTMLElement | null, HTMLElement | null>>
  type: Ref<Type, Type>
  name: Readonly<Ref<string, string>>
  componentName: keyof ComponentRegistry<Record<string, any>>
  form$: VfFormContext<EntryProps<Record<string, any>>> | undefined
  uid: Ref<string, string>
  id: ComputedRef<string>
  container: ContainerContext
  path: ComputedRef<string>
  children: VueformChildren
  available: ComputedRef<boolean>
  visible: ComputedRef<boolean>
  viewLoaded: Ref<boolean, boolean>
  genericName: ComputedRef<string>
}
```
