```ts
/**
 * Slots available in the VfContent component.
 */
interface VfContentSlots extends ContentSlots<VfContentContext> {
  /**
   * Default slot that replaces the content. Receives the full component
   * context.
   *
   * @exposes VfContent
   */
  default: (scope: { context: VfContentContext }) => VNode[]
}
```
