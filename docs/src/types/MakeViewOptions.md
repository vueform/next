```ts
/**
 * Configuration for the element factory providing core lifecycle, state, and
 * composition for a form element.
 */
type MakeViewOptions = {
  props: {
    name: ElementName
    columns: ColumnsProp | undefined
    page: PageProp | undefined
    label: TProp | undefined
    help: TProp | undefined
    description: TProp | undefined
    id: TProp | undefined
    hideLabel: boolean | undefined

    /**
     * Custom Vue components to use for named slots.
     */
    slots: Record<string, any> | undefined

    /**
     * The floating label of the element.
     */
    floating?: TProp

    /**
     * The float label of the element.
     */
    floatLabel?: TProp

    /**
     * The in-field top aligned label of the element.
     */
    ifta?: TProp

    /**
     * @write
     */
    placeholder?: TProp
    displayName?: TProp
  }
  deps: ReturnsOf<[[typeof makeElement, ['id', 'container', 'form$', 'path']]]>
}
```
