```ts
/**
 * Slots available in the VfNav component.
 */
interface VfNavSlots extends NavSlots<VfNavContext> {
  /**
   * Slot that replaces the back button. The payload is what VfNav provides — a
   * fixed list, independent of the registered `VfButton`'s prop surface, since
   * the slot may render anything.
   *
   * @param props.class CSS classes for the back button.
   * @param props.label The button label text.
   * @param props.pager The pager instance managing navigation state.
   * @param props.form$ The form's component context.
   * @param props.disabled Whether the button is disabled.
   * @param props.a11yBindings Ready-to-spread ARIA attribute bindings for the
   *   rendered control.
   * @param props.back Handler to navigate back.
   */
  back: (props: {
    class: ClassValue
    label: TProp | string | undefined
    pager: Pager
    form$: any
    disabled: boolean | string | ConditionalProp
    fluid: boolean
    a11yBindings: NavBackAriaBindings
    back: () => Promise<void>
  }) => VNode[]

  /**
   * Slot that replaces the back button's text label.
   *
   * @param props.label The button label text.
   * @param props.pager The pager instance managing navigation state.
   * @param props.form$ The form's component context.
   */
  backText: (props: {
    label: string | undefined
    pager: Pager
    form$: any
  }) => VNode[]

  /**
   * Slot that replaces the next button. The payload is what VfNav provides — a
   * fixed list, independent of the registered `VfButton`'s prop surface, since
   * the slot may render anything.
   *
   * @param props.class CSS classes for the next button.
   * @param props.label The button label text.
   * @param props.pager The pager instance managing navigation state.
   * @param props.form$ The form's component context.
   * @param props.disabled Whether the button is disabled.
   * @param props.loading Whether the form is in a loading state.
   * @param props.a11yBindings Ready-to-spread ARIA attribute bindings for the
   *   rendered control.
   * @param props.next Handler to navigate to the next step.
   */
  next: (props: {
    class: ClassValue
    label: TProp | string | undefined
    pager: Pager
    form$: any
    disabled: boolean | string | ConditionalProp
    loading: boolean | ConditionalProp
    fluid: boolean
    a11yBindings: NavForwardAriaBindings
    next: () => Promise<void>
  }) => VNode[]

  /**
   * Slot that replaces the next button's text label.
   *
   * @param props.label The button label text.
   * @param props.pager The pager instance managing navigation state.
   * @param props.form$ The form's component context.
   */
  nextText: (props: {
    label: string | undefined
    pager: Pager
    form$: any
  }) => VNode[]

  /**
   * Slot that replaces the finish button. The payload is what VfNav provides —
   * a fixed list, independent of the registered `VfButton`'s prop surface,
   * since the slot may render anything.
   *
   * @param props.class CSS classes for the finish button.
   * @param props.label The button label text.
   * @param props.pager The pager instance managing navigation state.
   * @param props.form$ The form's component context.
   * @param props.disabled Whether the button is disabled.
   * @param props.loading Whether the form is in a loading state.
   * @param props.a11yBindings Ready-to-spread ARIA attribute bindings for the
   *   rendered control.
   * @param props.finish Handler to finish/submit the form.
   */
  finish: (props: {
    class: ClassValue
    label: TProp | string | undefined
    pager: Pager
    form$: any
    disabled: boolean | string | ConditionalProp
    loading: boolean | ConditionalProp
    fluid: boolean
    a11yBindings: NavForwardAriaBindings
    finish: () => Promise<void>
  }) => VNode[]

  /**
   * Slot that replaces the finish button's text label.
   *
   * @param props.label The button label text.
   * @param props.pager The pager instance managing navigation state.
   * @param props.form$ The form's component context.
   */
  finishText: (props: {
    label: string | undefined
    pager: Pager
    form$: any
  }) => VNode[]
}
```
