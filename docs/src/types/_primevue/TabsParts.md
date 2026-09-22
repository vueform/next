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
   * @write
   *
   * @tag Tab
   */
  tab: (page: ResolvedPage) => TabProps
}
```
