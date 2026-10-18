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
   * Each tab wrapper. State is exposed via `data-selected` and `data-invalid`
   * attributes.
   */
  wrapper: ClassValue

  /**
   * The tab button element.
   */
  tab: ClassValue
}
```
