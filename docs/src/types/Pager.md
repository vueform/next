```ts
/**
 * The public API surface returned by `usePager`, providing page state,
 * navigation methods, validation, and event subscription.
 */
type Pager = {
  /**
   * The name of the currently selected page.
   */
  page: PageName | undefined

  /**
   * The name of the previously selected page.
   */
  oldPage: PageName | undefined

  /**
   * The zero-based index of the currently selected page.
   */
  index: number

  /**
   * Whether the pager is active and should render pages.
   */
  active: boolean

  /**
   * The index of the last enabled page (used in sequential mode to track
   * progress).
   */
  lastEnabled: number

  /**
   * Whether any page is currently loading (busy or has an event in progress).
   */
  loading: boolean

  /**
   * Whether any page has validation errors.
   */
  invalid: boolean

  /**
   * Whether pages must be navigated in sequential order.
   */
  sequential: boolean | undefined

  /**
   * The array of resolved page objects containing metadata, state, and methods
   * for each page.
   */
  pages: ResolvedPage[]

  /**
   * The next available page after the current one, or undefined if none exists.
   */
  nextPage: ResolvedPage | undefined

  /**
   * The previous available page before the current one, or undefined if none
   * exists.
   */
  previousPage: ResolvedPage | undefined

  /**
   * The currently selected resolved page object.
   */
  currentPage: ResolvedPage | undefined

  /**
   * The name of the last available page.
   */
  lastPage: PageName | undefined

  /**
   * Selects a page by name or index, optionally reverting enabled state and
   * pushing to browser history.
   *
   * @param name The page name or index to select.
   * @param reverting Whether to allow reverting the last enabled index.
   * @param pushHistory Whether to push the selection to browser history.
   */
  select: (
    name: PageName,
    reverting?: boolean,
    pushHistory?: boolean
  ) => Promise<void>

  /**
   * Advances to the next available page after validating the current one.
   */
  next: () => Promise<void>

  /**
   * Navigates back to the previous available page.
   */
  back: () => Promise<void>

  /**
   * Completes the pager by validating all enabled pages and firing the `finish`
   * event.
   */
  finish: () => Promise<void>

  /**
   * Resets the pager to the first page and unvalidates all subsequent pages.
   */
  reset: () => void

  /**
   * Reverts the pager to a specific page, unvalidating all pages after it.
   *
   * @param page The page name or index to revert to.
   */
  revertTo: (page: PageName) => void

  /**
   * Subscribes a callback to a specific event.
   *
   * @param e The event name.
   * @param callback The handler to invoke when the event fires.
   */
  on: EventListener<TypeEmitsToOptions<PagerEmits>>

  /**
   * Removes a previously registered event callback.
   *
   * @param e The event name.
   * @param callback The handler to remove. Omit to remove all listeners for the
   *   event.
   */
  off: EventListener<TypeEmitsToOptions<PagerEmits>>

  /**
   * Enables all pages up to the given page index, optionally allowing revert to
   * an earlier index.
   *
   * @param page The page name or index to enable up to.
   * @param allowRevert Whether to allow reverting to an earlier enabled index.
   */
  enableUntil: (page: PageName | undefined, allowRevert?: boolean) => void

  /**
   * Returns the resolved page object for the given page name or index.
   *
   * @param page The page name or index to look up.
   */
  getPage: (page: PageName | undefined) => ResolvedPage | undefined
}
```
