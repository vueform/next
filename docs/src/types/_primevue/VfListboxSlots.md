```ts
/**
 * Slots available in the VfListbox component.
 *
 * Forwarded PrimeVue slot shapes use wide item/model types.
 */
interface VfListboxSlots<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
>
  extends
    ListboxSlots<
      VfListboxContext<
        VfListboxProps<
          TOptions,
          TOptionValueKey,
          TGroupChildren,
          TMultiple,
          TModel,
          TOptionValueReturn
        >
      >
    >,
    /* @vue-ignore */ OverrideSlots<
      ForwardedSlots<AListboxSlots, (typeof forwards.slots)[number]>,
      {
        /**
         * Custom header template.
         */
        header: (scope: {
          /**
           * Value of the component.
           */
          value: any

          /**
           * Displayed options.
           */
          options: any[]
        }) => VNode[]

        /**
         * Custom footer template.
         */
        footer: (scope: {
          /**
           * Value of the component.
           */
          value: any

          /**
           * Displayed options.
           */
          options: any[]
        }) => VNode[]

        /**
         * Custom option template.
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
         * Custom option group template.
         */
        optiongroup: (scope: {
          /**
           * The raw option group (or raw item when ungrouped).
           */
          option: any

          /**
           * Index of the option group.
           */
          index: number
        }) => VNode[]

        /**
         * Custom content template.
         */
        content: (scope: {
          /**
           * An array of objects to display for virtualscroller.
           */
          items: any[]

          /**
           * Style class of the component.
           */
          styleClass: string

          /**
           * Reference of the content.
           *
           * @param el The element of the content reference.
           */
          contentRef: (el: any) => void

          /**
           * Options of the items.
           *
           * @param index The rendered index of the item.
           */
          getItemOptions: (index: number) => VirtualScrollerItemOptions
        }) => VNode[]
      }
    > {}
```
