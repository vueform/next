```ts
/**
 * Event map for pager navigation actions.
 */
type PagerEmits = {
  /**
   * Fired after a page is selected.
   *
   * @param newPage The page being navigated to.
   * @param oldPage The page being navigated away from.
   */
  select: [newPage: ResolvedPage, oldPage: ResolvedPage]

  /**
   * Fired after a step transition (next or back).
   *
   * @param newPage The page being navigated to.
   * @param oldPage The page being navigated away from.
   */
  step: [newPage: ResolvedPage, oldPage: ResolvedPage]

  /**
   * Fired after navigating to the previous page.
   *
   * @param newPage The page being navigated to.
   * @param oldPage The page being navigated away from.
   */
  back: [newPage: ResolvedPage, oldPage: ResolvedPage]

  /**
   * Fired after advancing to the next page.
   *
   * @param newPage The page being navigated to.
   * @param oldPage The page being navigated away from.
   */
  next: [newPage: ResolvedPage, oldPage: ResolvedPage]

  /**
   * Fired when all pages are validated and the pager completes.
   */
  finish: []

  /**
   * Fired when a page fails validation during navigation.
   *
   * @param page The page that failed validation.
   */
  invalid: [page: ResolvedPage]

  /**
   * Fired before a page selection is applied. Return `false` to cancel.
   *
   * @param newPage The page about to be navigated to.
   * @param oldPage The page about to be navigated away from.
   */
  beforeSelect: [newPage: ResolvedPage, oldPage: ResolvedPage]

  /**
   * Fired before a step transition. Return `false` to cancel.
   *
   * @param newPage The page about to be navigated to.
   * @param oldPage The page about to be navigated away from.
   */
  beforeStep: [newPage: ResolvedPage, oldPage: ResolvedPage]

  /**
   * Fired before navigating back. Return `false` to cancel.
   *
   * @param newPage The page about to be navigated to.
   * @param oldPage The page about to be navigated away from.
   */
  beforeBack: [newPage: ResolvedPage, oldPage: ResolvedPage]

  /**
   * Fired before advancing to the next page. Return `false` to cancel.
   *
   * @param newPage The page about to be navigated to.
   * @param oldPage The page about to be navigated away from.
   */
  beforeNext: [newPage: ResolvedPage, oldPage: ResolvedPage]

  /**
   * Fired before the pager finishes. Return `false` to cancel.
   */
  beforeFinish: []
}
```
