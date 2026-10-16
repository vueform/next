```ts
/**
 * CSS classes for the VfTabs component's structural parts.
 */
interface VfTabsClasses extends TabsClasses {
  /**
   * The root tabs container element.
   */
  root: ClassValue

  /**
   * The tab list element.
   */
  list: ClassValue

  /**
   * Each tab wrapper. Receives the resolved page data.
   *
   * @param page The resolved page data for this tab.
   */
  wrapper: (page: ResolvedPage) => ClassValue

  /**
   * The tab button element.
   */
  tab: ClassValue
}
```
