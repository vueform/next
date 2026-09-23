import type { HeadingProp, ClassValue, DomAttrsOf } from '@vueform/core'
import type { VNode } from 'vue'

declare module '@vueform/core' {
  interface BaseElementSlots {
    /**
     * Slot for customizing the element's label content.
     *
     * @param props.label The resolved label text.
     */
    label: (props: { label?: string }) => VNode[]
    /**
     * Slot for customizing the required indicator.
     */
    required: () => VNode[]
    /**
     * Slot for customizing the help text.
     *
     * @param props.help The resolved help text.
     */
    help: (props: { help?: string }) => VNode[]
    /**
     * Slot for customizing the description text.
     *
     * @param props.description The resolved description text.
     */
    description: (props: { description?: string }) => VNode[]
    /**
     * Slot for customizing the validation errors display.
     *
     * @param props.errors The list of validation error messages.
     */
    errors: (props: { errors: string[] }) => VNode[]
    /**
     * Slot for customizing the info messages display.
     *
     * @param props.messages The list of info messages.
     */
    messages: (props: { messages: string[] }) => VNode[]
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
     * The label element.
     *
     * @tag label | span | h1 | h2 | h3 | h4 | h5 | h6
     */
    label?: DomAttrsOf<
      'label' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    >
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
