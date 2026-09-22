```ts
/**
 * Slots available in the VfGroup component.
 */
interface VfGroupSlots extends GroupSlots<VfGroupContext> {
  /**
   * Slot that replaces the wrapper element. Receives the wrapper class and
   * resolved schema.
   */
  wrapper: (props: {
    class: ClassValue
    resolvedSchema: ResolvedSchema
    label?: string
  }) => VNode[]

  /**
   * Slot that replaces the default content. Receives the resolved schema for
   * rendering children.
   */
  default: (props: { resolvedSchema: ResolvedSchema }) => VNode[]
}
```
