import type { HeadingProp, ClassValue, DomAttrsOf } from '@vueform/core'
import type { VNode } from 'vue'

declare module '@vueform/core' {
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
  }

  interface BaseElementParts {
    /**
     * The wrapper around `root` with `display: contents` when the element is a
     * step or a tab.
     *
     * @tag div
     */
    panel?: DomAttrsOf<'div'>
    /**
     * The element's root wrapper.
     *
     * @tag div | fieldset
     */
    root?: DomAttrsOf<'div' | 'fieldset'>
    /**
     * The container holding the label and required indicator.
     *
     * @tag div
     */
    labelGroup?: DomAttrsOf<'div'>
    /**
     * The required indicator.
     *
     * @tag div
     */
    required?: DomAttrsOf<'div'>
    /**
     * The container wrapping the input and related UI.
     *
     * @tag div
     */
    elementGroup?: DomAttrsOf<'div'>
    /**
     * The wrapper directly around the input control.
     *
     * @tag div
     */
    elementWrapper?: DomAttrsOf<'div'>
    /**
     * The help text area.
     *
     * @tag div
     */
    help?: DomAttrsOf<'div'>
    /**
     * The description text area.
     *
     * @tag div
     */
    description?: DomAttrsOf<'div'>
    /**
     * The validation errors container.
     *
     * @tag div
     */
    errors?: DomAttrsOf<'div'>
    /**
     * An individual validation error.
     *
     * @tag div
     */
    error?: DomAttrsOf<'div'>
    /**
     * The info messages container.
     *
     * @tag div
     */
    messages?: DomAttrsOf<'div'>
    /**
     * An individual info message.
     *
     * @tag div
     */
    message?: DomAttrsOf<'div'>
  }

  interface BaseFieldElementParts {
    /**
     * The label element, associated with the control via `for`.
     *
     * @tag label | span
     */
    label?: DomAttrsOf<'label' | 'span'>
  }

  interface BaseContainerElementParts {
    /**
     * The label element; renders as the corresponding heading when the
     * container's `heading` prop is set.
     *
     * @tag span | h1 | h2 | h3 | h4 | h5 | h6
     */
    label?: DomAttrsOf<'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'>
  }

  interface BaseElementClasses {
    /**
     * The element's root wrapper.
     */
    root: (props: {
      spaceTop?: number
      spaceBottom?: number
      lineTop?: boolean
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
     * The container wrapping the input and related UI.
     */
    elementGroup: ClassValue
    /**
     * The wrapper directly around the input control.
     */
    elementWrapper: ClassValue
    /**
     * The help text area.
     */
    help: ClassValue
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
