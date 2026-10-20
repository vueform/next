```ts
/**
 * Slots available in the VfTabs component.
 */
interface VfTabsSlots extends TabbedSlots<VfTabsContext> {
  /**
   * Slot that replaces each tab wrapper element. Receives tab state and page
   * info.
   */
  wrapper: (scope: {
    /**
     * The zero-based index of the tab's page.
     */
    index: number

    /**
     * The tab's resolved label text.
     */
    label?: string

    /**
     * The metadata object from the page prop's tuple form.
     */
    meta?: Record<string, any>

    /**
     * Whether the tab is currently selected.
     */
    selected: boolean

    /**
     * Whether the tab's page has validation errors.
     */
    invalid: boolean

    /**
     * Whether the tab's page is busy validating or processing an event.
     */
    loading: boolean

    /**
     * The tab's element context.
     */
    el$: UnknownElement

    /**
     * The resolved page object for this tab.
     */
    page: ResolvedPage
  }) => VNode[]

  /**
   * Slot that replaces each tab's inner content. Receives tab state.
   */
  default: (scope: {
    /**
     * The zero-based index of the tab's page.
     */
    index: number

    /**
     * The tab's resolved label text.
     */
    label?: string

    /**
     * The metadata object from the page prop's tuple form.
     */
    meta?: Record<string, any>

    /**
     * Whether the tab is currently selected.
     */
    selected: boolean

    /**
     * Whether the tab's page has validation errors.
     */
    invalid: boolean

    /**
     * Whether the tab's page is busy validating or processing an event.
     */
    loading: boolean

    /**
     * The tab's element context.
     */
    el$: UnknownElement

    /**
     * The tab button's resolved bindings (part overrides, state attributes);
     * apply with `v-bind`.
     */
    bindings: PartBindings<'tab', VfTabsParts, VfTabsBindings>
  }) => VNode[]
}
```
