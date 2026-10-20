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
   * @param scope The back slot's params.
   */
  back: (scope: {
    /**
     * The button label text.
     */
    label: TProp | string | undefined

    /**
     * The pager instance managing navigation state.
     */
    pager: Pager

    /**
     * The form's component context.
     */
    form$: any

    /**
     * Whether the button is disabled.
     */
    disabled: boolean | string | ConditionalProp

    /**
     * Whether the nav is in fluid position mode — the button stretches to the
     * full available width.
     */
    fluid: boolean

    /**
     * The back button's resolved bindings (part overrides, ARIA state); apply
     * with `v-bind`.
     */
    bindings: VfNavBags['back']

    /**
     * Handler to navigate back.
     */
    back: () => Promise<void>
  }) => VNode[]

  /**
   * Slot that replaces the back button's text label.
   *
   * @param scope The back-text slot's params.
   */
  'back-text': (scope: {
    /**
     * The button label text.
     */
    label: string | undefined

    /**
     * The pager instance managing navigation state.
     */
    pager: Pager

    /**
     * The form's component context.
     */
    form$: any
  }) => VNode[]

  /**
   * Slot that replaces the next button. The payload is what VfNav provides — a
   * fixed list, independent of the registered `VfButton`'s prop surface, since
   * the slot may render anything.
   *
   * @param scope The next slot's params.
   */
  next: (scope: {
    /**
     * The button label text.
     */
    label: TProp | string | undefined

    /**
     * The pager instance managing navigation state.
     */
    pager: Pager

    /**
     * The form's component context.
     */
    form$: any

    /**
     * Whether the button is disabled.
     */
    disabled: boolean | string | ConditionalProp

    /**
     * Whether the form is in a loading state.
     */
    loading: boolean | ConditionalProp

    /**
     * Whether the nav is in fluid position mode — the button stretches to the
     * full available width.
     */
    fluid: boolean

    /**
     * The next button's resolved bindings (part overrides, loading modifier,
     * ARIA state); apply with `v-bind`.
     */
    bindings: VfNavBags['next']

    /**
     * Handler to navigate to the next step.
     */
    next: () => Promise<void>
  }) => VNode[]

  /**
   * Slot that replaces the next button's text label.
   *
   * @param scope The next-text slot's params.
   */
  'next-text': (scope: {
    /**
     * The button label text.
     */
    label: string | undefined

    /**
     * The pager instance managing navigation state.
     */
    pager: Pager

    /**
     * The form's component context.
     */
    form$: any
  }) => VNode[]

  /**
   * Slot that replaces the finish button. The payload is what VfNav provides —
   * a fixed list, independent of the registered `VfButton`'s prop surface,
   * since the slot may render anything.
   *
   * @param scope The finish slot's params.
   */
  finish: (scope: {
    /**
     * The button label text.
     */
    label: TProp | string | undefined

    /**
     * The pager instance managing navigation state.
     */
    pager: Pager

    /**
     * The form's component context.
     */
    form$: any

    /**
     * Whether the button is disabled.
     */
    disabled: boolean | string | ConditionalProp

    /**
     * Whether the form is in a loading state.
     */
    loading: boolean | ConditionalProp

    /**
     * Whether the nav is in fluid position mode — the button stretches to the
     * full available width.
     */
    fluid: boolean

    /**
     * The finish button's resolved bindings (part overrides, loading modifier,
     * ARIA state); apply with `v-bind`.
     */
    bindings: VfNavBags['finish']

    /**
     * Handler to finish/submit the form.
     */
    finish: () => Promise<void>
  }) => VNode[]

  /**
   * Slot that replaces the finish button's text label.
   *
   * @param scope The finish-text slot's params.
   */
  'finish-text': (scope: {
    /**
     * The button label text.
     */
    label: string | undefined

    /**
     * The pager instance managing navigation state.
     */
    pager: Pager

    /**
     * The form's component context.
     */
    form$: any
  }) => VNode[]
}
```
