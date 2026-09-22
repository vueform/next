```ts
/**
 * Slots available in the VfTreeSelect component.
 *
 * Forwarded PrimeVue slot shapes use wide node/model types.
 */
interface VfTreeSelectSlots<
  TOptions extends TreeOptionsProp = TreeOptionsProp,
  TSelectionMode extends TreeSelectionModeProp = undefined,
  TModel = any,
>
  extends
    TreeSelectSlots<
      VfTreeSelectContext<VfTreeSelectProps<TOptions, TSelectionMode, TModel>>
    >,
    FloatLabelSlots,
    IftaSlots,
    AddonsSlots,
    IconsSlots,
    /* @vue-ignore */ OverrideSlots<
      ForwardedSlots<ATreeSelectSlots, (typeof forwards.slots)[number]>,
      {
        /**
         * Custom selected value display.
         */
        value: (props: {
          /**
           * Selected tree nodes for display.
           */
          value: any

          /**
           * Placeholder prop value.
           */
          placeholder: string
        }) => VNode[]

        /**
         * Custom content for each tree node option.
         */
        option: (props: {
          /**
           * Current tree node.
           */
          node: any

          /**
           * Selection state.
           */
          selected: boolean

          /**
           * Expanded state.
           */
          expanded: boolean
        }) => VNode[]

        /**
         * Custom header template of the overlay panel.
         */
        header: (props: {
          /**
           * Selected keys map of the component.
           */
          value: any

          /**
           * An array of tree nodes.
           */
          options: any[]
        }) => VNode[]

        /**
         * Custom footer template of the overlay panel.
         */
        footer: (props: {
          /**
           * Selected keys map of the component.
           */
          value: any

          /**
           * An array of tree nodes.
           */
          options: any[]
        }) => VNode[]

        /**
         * Custom toggle icon for a tree node.
         */
        itemtoggleicon: (props: {
          /**
           * Current tree node.
           */
          node: any

          /**
           * Whether the node is expanded.
           */
          expanded: boolean

          /**
           * Style class of the icon.
           */
          class: string
        }) => VNode[]
      }
    > {}
```
