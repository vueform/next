```ts
/**
 * Structural parts of the VfTabs component.
 */
interface VfTabsParts extends TabbedParts {
  /**
   * The root tabs container element.
   *
   * @tag div
   */
  root: DomAttrsOf<'div'>

  /**
   * The tab list element.
   *
   * @tag ul
   */
  list: DomAttrsOf<'ul'>

  /**
   * Each tab wrapper. Receives the resolved page data.
   *
   * @param page The resolved page data for this tab.
   * @tag li
   */
  wrapper: (page: ResolvedPage) => DomAttrsOf<'li'>

  /**
   * The tab button element.
   *
   * @tag button
   */
  tab: DomAttrsOf<'button'>
}
```
