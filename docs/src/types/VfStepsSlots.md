```ts
/**
 * Slots available in the VfSteps component.
 */
interface VfStepsSlots extends StepsSlots<VfStepsContext> {
  /**
   * Slot that replaces each step wrapper element. Receives step state and page
   * info.
   */
  wrapper: (props: {
    class: ClassValue
    index: number
    label?: string
    meta?: Record<string, any>
    selected: boolean
    invalid: boolean
    loading: boolean
    enabled: boolean
    completed: boolean
    el$: UnknownElement
    page: ResolvedPage
  }) => VNode[]

  /**
   * Slot that replaces each step's inner content. Receives step state.
   */
  default: (props: {
    index: number
    label?: string
    meta?: Record<string, any>
    selected: boolean
    invalid: boolean
    loading: boolean
    enabled: boolean
    completed: boolean
    el$: UnknownElement
  }) => VNode[]
}
```
