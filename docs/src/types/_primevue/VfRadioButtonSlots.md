```ts
/**
 * Slots available in the VfRadioButton component.
 */
interface VfRadioButtonSlots<TRadioValue = any> extends RadioButtonSlots<
  VfRadioButtonContext<VfRadioButtonProps<TRadioValue>>
> {
  /**
   * Slot that replaces the default radio input rendering. Receives
   * input-specific props.
   */
  default: (scope: {
    /**
     * The value represented by the radio button when selected.
     */
    value: TRadioValue

    /**
     * The current model value.
     */
    model: TRadioValue | null

    /**
     * The `name` attribute of the input.
     */
    inputName: string

    /**
     * The element's unique ID.
     */
    id: string

    /**
     * Whether the input is disabled.
     */
    disabled: boolean

    /**
     * Ref to the underlying input element.
     */
    input: any

    /**
     * The resolved label text.
     */
    text: string | undefined

    /**
     * The component's resolved classes, keyed by part name.
     */
    classes: VfRadioButtonClasses

    /**
     * The component's resolved parts, keyed by part name.
     */
    parts: Partial<VfRadioButtonParts>

    /**
     * Part-keyed accessibility bindings; apply each key's bag to the matching
     * DOM part with `v-bind` (e.g. `v-bind="a11yBindings.input"`).
     */
    a11yBindings: VfRadioButtonA11y

    /**
     * The component's styling modifiers, keyed by part name; apply each bag
     * with `v-bind`.
     */
    modifiers: VfRadioButtonModifiers

    /**
     * Handles the input's blur event.
     *
     * @param e The native blur event.
     */
    handleBlur: (e: FocusEvent) => void

    /**
     * Handles the input's focus event.
     *
     * @param e The native focus event.
     */
    handleFocus: (e: FocusEvent) => void

    /**
     * Handles the input's change event, updating the model.
     *
     * @param payload The new input value.
     * @param e The originating native event.
     */
    handleInput: (payload: any, e?: Event) => void

    /**
     * Handles a native input event, updating the model from the event target.
     *
     * @param e The native input event.
     */
    handleModelUpdate: (e: Event) => void
  }) => VNode[]

  /**
   * Slot that replaces the text/label portion of the radio.
   *
   * @param scope The text slot's params.
   */
  text: (scope: {
    /**
     * The resolved label text.
     */
    text: string | undefined

    /**
     * The element's unique ID.
     */
    id: string

    /**
     * The element's display name for accessibility.
     */
    genericName: string

    /**
     * CSS classes for the text/label element.
     */
    classes: ClassValue

    /**
     * Resolved `part:text` attribute overrides for the text/label element;
     * apply with `v-bind`.
     */
    part: DomAttrsOf<'label'> | undefined
  }) => VNode[]
}
```
