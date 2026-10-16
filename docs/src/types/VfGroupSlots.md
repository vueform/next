```ts
/**
 * Slots available in the VfGroup component.
 */
interface VfGroupSlots extends GroupSlots<VfGroupContext> {
  /**
   * Slot that replaces the wrapper element. Receives the wrapper class and
   * resolved schema.
   */
  wrapper: (scope: {
    /**
     * CSS classes for the wrapper element.
     */
    class: ClassValue

    /**
     * The resolved schema of the group's child elements.
     */
    resolvedSchema: ResolvedSchema

    /**
     * The group's resolved label.
     */
    label?: string
  }) => VNode[]

  /**
   * Slot that replaces the default content. Receives the resolved schema for
   * rendering children.
   */
  default: (scope: {
    /**
     * The resolved schema of the group's child elements.
     */
    resolvedSchema: ResolvedSchema
  }) => VNode[]
}
```
