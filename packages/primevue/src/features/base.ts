import { type ClassValue, type DOMAttrs, type HeadingProp } from '@vueform/core'
import type { MessageProps } from 'primevue/message'
import type { TabPanelProps } from 'primevue/tabpanel'
import type { TabsProps } from 'primevue/tabs'
import type { VNode } from 'vue'

declare module '@vueform/core' {
  interface BaseElementParts {
    /**
     * The wrapper around `root` with `display: contents` when the element is a
     * step or a tab.
     *
     * @tag TabPanel
     */
    panel?: TabPanelProps

    /**
     * The element's root wrapper.
     *
     * @tag div | fieldset
     */
    root?: DOMAttrs['div' | 'fieldset']

    /**
     * The container holding the label and required indicator.
     *
     * @tag div | legend
     */
    labelGroup?: DOMAttrs['div' | 'legend']

    /**
     * The required indicator.
     *
     * @tag div
     */
    required?: DOMAttrs['div']

    /**
     * Info container.
     *
     * @tag div
     */
    info?: DOMAttrs['div']

    /**
     * Icon for displaying info tooltip.
     *
     * @tag span
     */
    infoIcon?: DOMAttrs['span']

    /**
     * The container wrapping the input and related UI.
     *
     * @tag div | TabsProps
     */
    elementGroup?: DOMAttrs['div'] | TabsProps

    /**
     * The wrapper directly around the input control.
     *
     * @tag div
     */
    elementWrapper?: DOMAttrs['div']

    /**
     * The help text area.
     *
     * @tag Message
     */
    help?: MessageProps & Record<string, any>

    /**
     * The description text area.
     *
     * @tag Message
     */
    description?: MessageProps & Record<string, any>

    /**
     * The validation errors container.
     *
     * @tag Message
     */
    errors?: MessageProps & Record<string, any>

    /**
     * An individual validation error.
     *
     * @tag div
     */
    error?: DOMAttrs['div']

    /**
     * The info messages container.
     *
     * @tag div
     */
    messages?: DOMAttrs['div']

    /**
     * An individual info message.
     *
     * @tag div
     */
    message?: DOMAttrs['div']
  }

  interface BaseFieldElementParts {
    /**
     * The label element, associated with the control via `for`.
     *
     * @tag label | span
     */
    label?: DOMAttrs['label' | 'span']
  }

  interface BaseContainerElementParts {
    /**
     * The label element; renders as the corresponding heading when the
     * container's `heading` prop is set.
     *
     * @tag span | h1 | h2 | h3 | h4 | h5 | h6
     */
    label?: DOMAttrs['span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6']
  }

  interface BaseElementSlots {
    /**
     * Slot for customizing the element's label content.
     *
     * @param scope The label slot's params.
     */
    label: (scope: {
      /**
       * The resolved label text.
       */
      label?: string
    }) => VNode[]

    /**
     * Slot for customizing the required indicator.
     */
    required: () => VNode[]

    /**
     * Slot for customizing the help text.
     *
     * @param scope The help slot's params.
     */
    help: (scope: {
      /**
       * The resolved help text.
       */
      help?: string
    }) => VNode[]

    /**
     * Slot for customizing the description text.
     *
     * @param scope The description slot's params.
     */
    description: (scope: {
      /**
       * The resolved description text.
       */
      description?: string
    }) => VNode[]

    /**
     * Slot for customizing the validation errors display.
     *
     * @param scope The errors slot's params.
     */
    errors: (scope: {
      /**
       * The list of validation error messages.
       */
      errors: string[]
    }) => VNode[]

    /**
     * Slot for customizing the info messages display.
     *
     * @param scope The messages slot's params.
     */
    messages: (scope: {
      /**
       * The list of info messages.
       */
      messages: string[]
    }) => VNode[]

    /**
     * Slot for customizing the info tooltip or helper content.
     *
     * @param scope The info slot's params.
     */
    info: (scope: {
      /**
       * The info text.
       */
      info?: string
    }) => VNode[]
  }

  interface BaseElementClasses {
    /**
     * The element's root wrapper.
     *
     * @param props The layout-related props the root classes depend on.
     */
    root: (props: {
      /**
       * Whether space is added above the layout.
       */
      spaceTop?: number

      /**
       * Whether space is added below the layout.
       */
      spaceBottom?: number

      /**
       * Whether a separator line is rendered above the layout.
       */
      lineTop?: boolean

      /**
       * Whether a separator line is rendered below the layout.
       */
      lineBottom?: boolean
    }) => ClassValue

    /**
     * The main content panel.
     */
    panel: ClassValue

    /**
     * The container holding the label and required indicator.
     */
    labelGroup: (heading?: HeadingProp) => ClassValue

    /**
     * The label element.
     */
    label: ClassValue

    /**
     * The required indicator.
     */
    required: ClassValue

    /**
     * The info tooltip or helper wrapper.
     */
    info: ClassValue

    /**
     * The info icon element.
     */
    infoIcon: ClassValue

    /**
     * The help text area.
     */
    help: ClassValue

    /**
     * The info tooltip.
     */
    infoTooltip: ClassValue

    /**
     * The container wrapping the input and related UI.
     */
    elementGroup: ClassValue

    /**
     * The wrapper directly around the input control.
     */
    elementWrapper: ClassValue

    /**
     * The loading indicator shown while the element is busy.
     */
    loading: ClassValue

    /**
     * The description text area.
     */
    description: ClassValue

    /**
     * The validation errors container.
     */
    errors: ClassValue

    /**
     * An individual validation error.
     */
    error: ClassValue

    /**
     * The info messages container.
     */
    messages: ClassValue

    /**
     * An individual info message.
     */
    message: ClassValue
  }
}
