```ts
/**
 * Slots available in the VfSelectButton component.
 *
 * Forwarded PrimeVue slot shapes use wide item/model types.
 */
interface VfSelectButtonSlots<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
>
  extends
    SelectButtonSlots<
      VfSelectButtonContext<
        VfSelectButtonProps<
          TOptions,
          TOptionValueKey,
          TMultiple,
          TModel,
          TOptionValueReturn
        >
      >
    >,
    /* @vue-ignore */ OverrideSlots<
      ForwardedSlots<ASelectButtonSlots, (typeof forwards.slots)[number]>,
      {
        /**
         * Custom content for each option.
         */
        option: (scope: {
          /**
           * The raw option item.
           */
          option: any

          /**
           * Index of the option.
           */
          index: number
        }) => VNode[]
      }
    > {}
```
