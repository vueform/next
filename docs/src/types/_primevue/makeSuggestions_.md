```ts
/**
 * Factory that normalizes AutoComplete suggestions via core `makeItems`,
 * mapping PrimeVue suggestion/option prop names onto the core items API.
 */
const makeSuggestions: (
  config?: MakeItemsConfig | undefined
) => (options: MakeSuggestionsOptions) => {
  suggestions: ComputedRef<any[] | undefined>
  resolvedItems: ShallowRef<any[] | Record<string, any>>
  selectedLabel: ComputedRef<string | string[] | undefined>
  itemLabel: ComputedRef<string | ((item: any) => string)>
  itemDisabled: ComputedRef<string | ((item: any) => boolean) | undefined>
  grouped: ComputedRef<boolean>
  resolving: ShallowRef<boolean>
  query: Ref<string, string>
  resolveItems: () => void
  handleComplete: (event: AutoCompleteCompleteEvent) => void
  handleChange: (event: AutoCompleteChangeEvent) => void
}
```
