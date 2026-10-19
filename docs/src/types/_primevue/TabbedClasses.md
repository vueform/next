```ts
/**
 * @write
 */
interface TabbedClasses {
  /**
   * The tab list element.
   */
  tabs: ClassValue

  /**
   * Each individual tab element.
   *
   * @param page The tab’s resolved page.
   */
  tab: (page: ResolvedPage) => ClassValue
}
```
