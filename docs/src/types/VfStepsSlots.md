```ts
/**
 * Slots available in the VfSteps component.
 */
interface VfStepsSlots extends StepsSlots<VfStepsContext> {
  /**
   * Slot that replaces each step wrapper element. Receives step state and page
   * info.
   */
  wrapper: (scope: {
    /**
     * The zero-based index of the step's page.
     */
    index: number

    /**
     * The step's resolved label text.
     */
    label?: string

    /**
     * The metadata object from the page prop's tuple form.
     */
    meta?: Record<string, any>

    /**
     * Whether the step is currently selected.
     */
    selected: boolean

    /**
     * Whether the step's page has validation errors.
     */
    invalid: boolean

    /**
     * Whether the step's page is busy validating or processing an event.
     */
    loading: boolean

    /**
     * Whether the step is enabled for navigation.
     */
    enabled: boolean

    /**
     * Whether the step's page has been completed.
     */
    completed: boolean

    /**
     * The step's element context.
     */
    el$: UnknownElement

    /**
     * The resolved page object for this step.
     */
    page: ResolvedPage
  }) => VNode[]

  /**
   * Slot that replaces each step's inner content. Receives step state.
   */
  default: (scope: {
    /**
     * The zero-based index of the step's page.
     */
    index: number

    /**
     * The step's resolved label text.
     */
    label?: string

    /**
     * The metadata object from the page prop's tuple form.
     */
    meta?: Record<string, any>

    /**
     * Whether the step is currently selected.
     */
    selected: boolean

    /**
     * Whether the step's page has validation errors.
     */
    invalid: boolean

    /**
     * Whether the step's page is busy validating or processing an event.
     */
    loading: boolean

    /**
     * Whether the step is enabled for navigation.
     */
    enabled: boolean

    /**
     * Whether the step's page has been completed.
     */
    completed: boolean

    /**
     * The step's element context.
     */
    el$: UnknownElement

    /**
     * The step button's resolved bindings (part overrides, state attributes);
     * apply with `v-bind`.
     */
    bindings: PartBindings<'step', VfStepsParts, VfStepsBindings>
  }) => VNode[]
}
```
