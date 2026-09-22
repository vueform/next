```ts
/**
 * Slots available in the VfAddon component.
 */
interface VfAddonSlots extends AddonSlots<VfAddonContext> {
  /**
   * Default slot for addon content.
   */
  default: () => VNode[]
}
```
