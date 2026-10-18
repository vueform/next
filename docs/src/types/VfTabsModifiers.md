```ts
/**
 * Styling modifiers of the VfTabs component.
 */
interface VfTabsModifiers extends TabsModifiers {
  /**
   * Each tab wrapper's selection and validity state.
   *
   * @param page The resolved page data for this tab.
   */
  wrapper: (page: ResolvedPage) => {
    'data-selected'?: ''
    'data-invalid'?: ''
  }
}
```
