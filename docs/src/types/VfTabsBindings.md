```ts
/**
 * Part-keyed binding definitions of the VfTabs component, registered via
 * `useBindings`. The `wrapper` entry is a parameterized resolver, so the key
 * is functional — the template calls `bindings.wrapper(page)`.
 */
interface VfTabsBindings extends TabsBindings {
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
