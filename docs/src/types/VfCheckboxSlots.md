```ts
/**
 * Slots available in the VfCheckbox component.
 */
interface VfCheckboxSlots<
  TTrueValue = any,
  TFalseValue = any,
> extends CheckboxSlots<
  VfCheckboxContext<VfCheckboxProps<TTrueValue, TFalseValue>>
> {
  /**
   * Slot that replaces the default checkbox rendering. Receives input-specific
   * props.
   */
  default: (scope: {
    /**
     * The current model value.
     */
    model: TTrueValue | TFalseValue

    /**
     * The value used when the checkbox is checked.
     */
    trueValue: TTrueValue

    /**
     * The value used when the checkbox is unchecked.
     */
    falseValue: TFalseValue

    /**
     * The input's `name` attribute.
     */
    inputName: string

    /**
     * The input's `id` attribute.
     */
    id: string

    /**
     * Whether the checkbox is disabled.
     */
    disabled: boolean

    /**
     * The input DOM element reference.
     */
    input: any

    /**
     * The checkbox label text.
     */
    text: string | undefined

    /**
     * The component's resolved classes, keyed by part name.
     */
    classes: VfCheckboxClasses

    /**
     * The component's resolved parts, keyed by part name.
     */
    parts: Partial<VfCheckboxParts>

    /**
     * Part-keyed accessibility bindings; apply each key's bag to the matching
     * DOM part with `v-bind` (e.g. `v-bind="a11yBindings.input"`).
     */
    a11yBindings: VfCheckboxA11y

    /**
     * The component's styling modifiers, keyed by part name; apply each bag
     * with `v-bind`.
     */
    modifiers: VfCheckboxModifiers

    /**
     * Handler for the input's blur event.
     *
     * @param e The native blur event.
     */
    handleBlur: (e: FocusEvent) => void

    /**
     * Handler for the input's focus event.
     *
     * @param e The native focus event.
     */
    handleFocus: (e: FocusEvent) => void

    /**
     * Handler that updates the model from an input event.
     *
     * @param e The native input event.
     */
    handleModelUpdate: (e: Event) => void
  }) => VNode[]

  /**
   * Slot that replaces the text/label portion of the checkbox.
   */
  text: (scope: {
    /**
     * The checkbox label text.
     */
    text: string | undefined

    /**
     * The input's `id` attribute.
     */
    id: string

    /**
     * The element's generic name, used as screen-reader-only fallback text.
     */
    genericName: string

    /**
     * CSS classes for the text element.
     */
    classes: ClassValue

    /**
     * Resolved `part:text` attribute overrides for the text element; apply
     * with `v-bind`.
     */
    part: DomAttrsOf<'label'> | undefined
  }) => VNode[]
}
```
