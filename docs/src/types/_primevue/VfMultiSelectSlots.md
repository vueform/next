```ts
/**
 * Slots available in the VfMultiSelect component.
 *
 * `#template` is generic-aware; forwarded PrimeVue slot shapes use wide
 * item/model types.
 */
interface VfMultiSelectSlots<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
>
  extends
    MultiSelectSlots<
      VfMultiSelectContext<
        VfMultiSelectProps<
          TOptions,
          TOptionValueKey,
          TGroupChildren,
          TModel,
          TOptionValueReturn
        >
      >
    >,
    FloatLabelSlots,
    IftaSlots,
    AddonsSlots,
    IconsSlots,
    /* @vue-ignore */ OverrideSlots<
      ForwardedSlots<AMultiSelectSlots, (typeof forwards.slots)[number]>,
      {
        /**
         * Custom selected value display.
         */
        value: (scope: {
          /**
           * Selected values of the component.
           */
          value: any

          /**
           * Placeholder prop value.
           */
          placeholder: string
        }) => VNode[]

        /**
         * Custom chip template for a selected value.
         */
        chip: (scope: {
          /**
           * A value in the selection.
           */
          value: any

          /**
           * Removes the chip from the selection.
           *
           * @param event Browser event.
           * @param item Selected value to remove.
           */
          removeCallback: (event: Event, item: any) => void
        }) => VNode[]

        /**
         * Custom chip remove icon template.
         */
        chipicon: (scope: {
          /**
           * Style class of the icon.
           */
          class: string

          /**
           * Selected value associated with the chip.
           */
          item: any

          /**
           * Removes the chip from the selection.
           *
           * @param event Browser event.
           * @param item Selected value to remove.
           */
          removeCallback: (event: Event, item: any) => void
        }) => VNode[]

        /**
         * Custom header template of the overlay panel.
         */
        header: (scope: {
          /**
           * Selected values of the component.
           */
          value: any

          /**
           * Displayed options.
           */
          options: any[]
        }) => VNode[]

        /**
         * Custom footer template of the overlay panel.
         */
        footer: (scope: {
          /**
           * Selected values of the component.
           */
          value: any

          /**
           * Displayed options.
           */
          options: any[]
        }) => VNode[]

        /**
         * Custom content for each option.
         */
        option: (scope: {
          /**
           * The raw option item.
           */
          option: any

          /**
           * Selection state.
           */
          selected: boolean

          /**
           * Index of the option.
           */
          index: number
        }) => VNode[]

        /**
         * Custom content for each option group.
         */
        optiongroup: (scope: {
          /**
           * The option group, or raw item when groups are not used.
           */
          option: any

          /**
           * Index of the option group.
           */
          index: number
        }) => VNode[]

        /**
         * Custom content template for virtual scrolling.
         */
        content: (scope: {
          /**
           * Items to display for the virtual scroller.
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
