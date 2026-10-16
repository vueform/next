```ts
/**
 * A fully resolved page object containing its metadata, navigation state,
 * validation helpers, and keyboard/focus handlers.
 */
type ResolvedPage = {
  /**
   * The resolved label text for the page tab.
   */
  label: string | undefined

  /**
   * The metadata object from the page prop's tuple form (including `label`).
   * `undefined` when the page prop is a plain text value.
   */
  meta: Record<string, any> | undefined

  /**
   * The element names contained in this page.
   */
  elements: ElementName[]

  /**
   * The unique name identifying this page.
   */
  name: PageName

  /**
   * The zero-based index of this page in the page list.
   */
  index: number

  /**
   * The HTML `id` for the page's tab element (accessibility).
   */
  pageId: string

  /**
   * The HTML `id` for the page's panel element (accessibility).
   */
  panelId: string

  /**
   * The tab's `tabindex` value for keyboard navigation.
   */
  tabindex: number

  /**
   * Whether the page is currently available (visible).
   */
  available: boolean | boolean

  /**
   * Whether this page is the currently selected page.
   */
  selected: boolean

  /**
   * Whether the page has been completed (validated without errors and not the
   * current page).
   */
  completed: boolean

  /**
   * Whether the page is enabled for navigation (based on sequential progress).
   */
  enabled: boolean

  /**
   * Whether the page has validation errors.
   */
  invalid: boolean

  /**
   * Whether the page is busy validating or processing an event.
   */
  loading: boolean

  /**
   * The page's element component context, if registered.
   */
  el$: any | undefined

  /**
   * Validates all elements within this page and returns whether it passed.
   */
  validate: () => Promise<boolean>

  /**
   * Resets the validation state for all elements within this page.
   */
  unvalidate: () => void

  /**
   * Selects this page, making it the active page.
   */
  select: () => void

  /**
   * Handles keyboard navigation events on the page tab.
   *
   * @param $event The keyboard event to handle.
   */
  keydown: ($event: KeyboardEvent) => void

  /**
   * Focuses the page tab for keyboard navigation.
   */
  focus: () => void

  /**
   * Blurs the page tab, removing keyboard focus.
   */
  blur: () => void
}
```
