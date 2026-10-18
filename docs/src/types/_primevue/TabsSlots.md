```ts
/**
 * @write
 */
interface TabsSlots {
  /**
   * Slot that replaces the tabs navigation bar. Receives the pager instance.
   */
  tabs: (scope: {
    /**
     * The pager instance controlling the tabs.
     */
    pager: Pager

    /**
     * CSS classes to apply to the tab list.
     */
    classes: ClassValue
  }) => VNode[]

  /**
   * Slot that replaces each individual tab.
   */
  tab: (scope: {
    /**
     * The resolved page of the tab.
     */
    page: ResolvedPage

    /**
     * CSS classes to apply to the tab.
     */
    classes: ClassValue
  }) => VNode[]
}
```
