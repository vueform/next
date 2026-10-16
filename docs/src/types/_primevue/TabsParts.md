```ts
/**
 * @write
 */
interface TabsParts {
  /**
   * Props forwarded to the nested TabList component.
   *
   * @tag TabList
   */
  tabs: TabListProps

  /**
   * Props forwarded to each nested Tab component.
   *
   * @param page The tab’s resolved page.
   * @tag Tab
   */
  tab: (page: ResolvedPage) => TabProps
}
```
