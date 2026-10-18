```ts
/**
 * Binding bags for the layout-rendered parts (label, help, description,
 * error): the ids the control's `aria-describedby` / `aria-labelledby` point
 * at, and the error region's alert role.
 */
interface A11yLayoutBags {
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
   * The error region's id and alert role, referenced by `aria-describedby`
   * while the element has errors.
   */
  error: {
    id: string
    role: 'alert'
  }
}
```
