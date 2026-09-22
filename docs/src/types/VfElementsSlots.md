```ts
/**
 * Slots available in the VfElements component.
 */
interface VfElementsSlots extends ElementsSlots<VfElementsContext> {
  /**
   * Slot for the default content of the elements container.
   */
  default: () => VNode[]
}
```
