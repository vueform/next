```ts
/**
 * CSS classes for the VfLayout component's structural parts.
 *
 * The base layout keys (`root`, `panel`, `labelGroup`, …) are declared here
 * directly rather than relying solely on adapter-augmented
 * `BaseElementClasses`: VfLayout is the only component that renders them, so
 * they must resolve inside `@vueform/core` on its own.
 */
interface VfLayoutClasses
  extends LayoutClasses, AddonGroupClasses, IconsClasses {
  /**
   * The element's root wrapper.
   *
   * @param props Spacing and divider values used when computing the root
   *   classes.
   */
  root: (props: {
    /**
     * Vertical spacing (padding) above the element, as a spacing token (1-3).
     */
    spaceTop?: number

    /**
     * Vertical spacing (padding) below the element, as a spacing token (1-3).
     */
    spaceBottom?: number

    /**
     * Whether a horizontal line (border) renders above the element.
     */
    lineTop?: boolean

    /**
     * Whether a horizontal line (border) renders below the element.
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
   * The help text area.
   */
  help: ClassValue

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
```
