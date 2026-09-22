```ts
/**
 * Slots available in the VfCascadeSelect component.
 *
 * Forwarded PrimeVue slot shapes use wide item/model types.
 */
interface VfCascadeSelectSlots<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends CascadeOptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
>
  extends
    CascadeSelectSlots<
      VfCascadeSelectContext<
        VfCascadeSelectProps<
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
      ForwardedSlots<ACascadeSelectSlots, (typeof forwards.slots)[number]>,
      {
        /**
         * Custom content for each option.
         */
        option: (props: {
          /**
           * The raw option item.
           */
          option: any

          /**
           * Selection state.
           */
          selected: boolean
        }) => VNode[]

        /**
         * Custom value template.
         */
        value: (props: {
          /**
           * Value of the component.
           */
          value: any

          /**
           * Placeholder text to show.
           */
          placeholder: string
        }) => VNode[]

        /**
         * Custom header template.
         */
        header: (props: {
          /**
           * Current value.
           */
          value: any

          /**
           * Options of the component.
           */
          options: any[]
        }) => VNode[]

        /**
         * Custom footer template.
         */
        footer: (props: {
          /**
           * Current value.
           */
          value: any

          /**
           * Options of the component.
           */
          options: any[]
        }) => VNode[]
      }
    > {}
```
