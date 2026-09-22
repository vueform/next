```ts
/**
 * @write
 */
interface TabsSlots {
  /**
   * Slot that replaces the tabs navigation bar. Receives the pager instance.
   */
  tabs: (props: { pager: Pager; class: ClassValue }) => VNode[]

  /**
   * Slot that replaces each individual tab.
   */
  tab: (props: { page: ResolvedPage; class: ClassValue }) => VNode[]
}
```
