```ts
/**
 * Resolved binding bags for the layout-rendered parts (label, help,
 * description, error): the ids the control's `aria-describedby` /
 * `aria-labelledby` point at, and the error region's alert role. The runtime
 * pattern supplies them as zero-argument resolvers (a definition-side
 * freedom), so they resolve at each part's consuming site while the keys stay
 * static.
 */
interface LayoutRegionBindings {
  /**
   * The label element's id, referenced by `aria-labelledby` relationships.
   */
  label: {
    id: string
  }

  /**
   * The help region's id, referenced by `aria-describedby` when help renders.
   */
  help: {
    id: string
  }

  /**
   * The description region's id, referenced by `aria-describedby`.
   */
  description: {
    id: string
  }

  /**
   * The errors container's id and alert role, referenced by
   * `aria-describedby` while the element has errors. Keyed `errors` to match
   * the part it binds to (the per-error item part is `error`).
   */
  errors: {
    id: string
    role: 'alert'
  }
}
```
