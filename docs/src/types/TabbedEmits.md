```ts
/**
 * Events emitted by components that support tabbed navigation.
 */
interface TabbedEmits {
  /**
   * Emitted when the active tab changes.
   *
   * @param newPage The page being navigated to.
   * @param oldPage The page being navigated from.
   * @param pager The pager instance managing tab state.
   * @param context$ The component's context instance.
   */
  tab: [
    newPage: ResolvedPage,
    oldPage: ResolvedPage,
    pager: Pager,
    context$: any,
  ]

  /**
   * Emitted before the active tab changes, allowing cancellation.
   *
   * @param newPage The page being navigated to.
   * @param oldPage The page being navigated from.
   * @param pager The pager instance managing tab state.
   * @param context$ The component's context instance.
   */
  beforeTab: [
    newPage: ResolvedPage,
    oldPage: ResolvedPage,
    pager: Pager,
    context$: any,
  ]
}
```
