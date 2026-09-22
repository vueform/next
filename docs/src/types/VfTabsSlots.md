```ts
/**
 * Slots available in the VfTabs component.
 */
interface VfTabsSlots extends TabbedSlots<VfTabsContext> {
  /**
   * Slot that replaces each tab wrapper element. Receives tab state and page
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
    el$: UnknownElement
    page: ResolvedPage
  }) => VNode[]

  /**
   * Slot that replaces each tab's inner content. Receives tab state.
   */
  default: (props: {
    index: number
    label?: string
    meta?: Record<string, any>
    selected: boolean
    invalid: boolean
    loading: boolean
    el$: UnknownElement
  }) => VNode[]
}
```
