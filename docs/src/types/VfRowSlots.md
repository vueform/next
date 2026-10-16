```ts
/**
 * Slots available in the VfRow component.
 */
interface VfRowSlots extends RowSlots<VfRowContext> {
  /**
   * Slot for the row's default content.
   */
  default: () => VNode[]
}
```
