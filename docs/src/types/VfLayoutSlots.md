```ts
/**
 * Slots available in the VfLayout component.
 */
interface VfLayoutSlots extends LayoutSlots<VfLayoutContext>, TabbedSlots {
  /**
   * Slot for the element's default content.
   */
  default: () => VNode[]
}
```
