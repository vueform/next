```ts
/**
 * IFTA label slot mixed into element components that support in-field
 * top-aligned labels.
 */
interface IftaSlots {
  /**
   * Slot for customizing the IFTA label content.
   *
   * @param props.ifta The IFTA label text.
   */
  ifta: (props: { ifta?: string }) => VNode[]
}
```
