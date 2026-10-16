```ts
/**
 * IFTA label slot mixed into element components that support in-field
 * top-aligned labels.
 */
interface IftaSlots {
  /**
   * Slot for customizing the IFTA label content.
   *
   * @param scope The ifta slot's params.
   */
  ifta: (scope: {
    /**
     * The IFTA label text.
     */
    ifta?: string
  }) => VNode[]
}
```
