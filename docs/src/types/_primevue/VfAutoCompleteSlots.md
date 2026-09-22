```ts
/**
 * Slots available in the VfAutoComplete component.
 *
 * `#template` is generic-aware; forwarded PrimeVue slot shapes use wide
 * item/model types.
 */
interface VfAutoCompleteSlots<
  TSuggestions extends SuggestionsProp = SuggestionsProp,
  TMultiple extends boolean = false,
  TModel = any,
>
  extends
    AutoCompleteSlots<
      VfAutoCompleteContext<
        VfAutoCompleteProps<TSuggestions, TMultiple, TModel>
      >
    >,
    FloatLabelSlots,
    IftaSlots,
    AddonsSlots,
    IconsSlots,
    /* @vue-ignore */ OverrideSlots<
      ForwardedSlots<AAutoCompleteSlots, (typeof forwards.slots)[number]>,
      {
        /**
         * Custom content for each suggestion option.
         */
        option: (props: {
          /**
           * The raw suggestion item.
           */
          option: any

          /**
           * Index of the option.
           */
          index: number
        }) => VNode[]

        /**
         * Custom content for each suggestion option group.
         */
        optiongroup: (props: {
          /**
           * The option group, or raw suggestion when groups are not used.
           */
          option: any

          /**
           * Index of the option group.
           */
          index: number
        }) => VNode[]

        /**
         * Custom chip template for a selected suggestion in multiple mode.
         */
        chip: (props: {
          /**
           * A selected suggestion value.
           */
          value: any

          /**
           * Index of the token.
           */
          index: number

          /**
           * Removes the chip from the selection.
           *
           * @param event Browser event.
           */
          removeCallback: (event: Event) => void
        }) => VNode[]

        /**
         * Custom header template of the overlay panel.
         */
        header: (props: {
          /**
           * Value of the component.
           */
          value: any

          /**
           * Displayed suggestions.
           */
          suggestions: any[]
        }) => VNode[]

        /**
         * Custom footer template of the overlay panel.
         */
        footer: (props: {
          /**
           * Value of the component.
           */
          value: any

          /**
           * Displayed suggestions.
           */
          suggestions: any[]
        }) => VNode[]

        /**
         * Custom content template for virtual scrolling.
         */
        content: (props: {
          /**
           * Suggestions to display for the virtual scroller.
           */
          items: any[]

          /**
           * Style class of the content.
           */
          styleClass: string

          /**
           * Sets the content element ref.
           *
           * @param el Content element.
           */
          contentRef: (el: any) => void

          /**
           * Returns virtual scroller item options for a rendered index.
           *
           * @param index Rendered index.
           */
          getItemOptions: (index: number) => any
        }) => VNode[]
      }
    > {}
```
