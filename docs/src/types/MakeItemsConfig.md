```ts
/**
 * Compile-time configuration a blueprint passes to `makeItems`.
 */
type MakeItemsConfig = {
  /**
   * Whether item and group conditions are evaluated and values of
   * filtered-out items are cleared from the model. Defaults to `true`.
   */
  conditions?: boolean

  /**
   * Whether the element always holds multiple selected values, regardless of
   * its `multiple` prop.
   */
  multiple?: boolean
}
```
